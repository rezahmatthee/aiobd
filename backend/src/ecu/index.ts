import { EventEmitter } from 'events';
import { randomBytes } from 'crypto';
import { ProtocolType, ECUInfo } from '../types';

function uuidv4(): string {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString('hex');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

export interface ECUSession {
  id: string;
  vehicleId: string;
  protocol: ProtocolType;
  startedAt: Date;
  isActive: boolean;
  securityLevel: number;
}

export interface ECUFlashOptions {
  verifyAfterWrite: boolean;
  createBackup: boolean;
  progressCallback?: (progress: number) => void;
}

export interface FlashResult {
  success: boolean;
  bytesWritten: number;
  duration: number;
  crc32: number;
  error?: string;
}

/** UDS service IDs */
const UDS = {
  DIAGNOSTIC_SESSION_CONTROL: 0x10,
  ECU_RESET: 0x11,
  SECURITY_ACCESS: 0x27,
  READ_DATA_BY_ID: 0x22,
  WRITE_DATA_BY_ID: 0x2E,
  REQUEST_DOWNLOAD: 0x34,
  REQUEST_UPLOAD: 0x35,
  TRANSFER_DATA: 0x36,
  TRANSFER_EXIT: 0x37,
  TESTER_PRESENT: 0x3E,
} as const;

export class ECUManager extends EventEmitter {
  private sessions: Map<string, ECUSession> = new Map();
  private readonly BLOCK_SIZE = 0x80; // 128 bytes per transfer block

  async startSession(vehicleId: string, protocol: ProtocolType): Promise<ECUSession> {
    // Send UDS DiagnosticSessionControl - extended session (0x03)
    await this.sendUDSRequest(UDS.DIAGNOSTIC_SESSION_CONTROL, Buffer.from([0x03]));

    const session: ECUSession = {
      id: uuidv4(),
      vehicleId,
      protocol,
      startedAt: new Date(),
      isActive: true,
      securityLevel: 0,
    };
    this.sessions.set(session.id, session);
    this.emit('sessionStarted', session);
    return session;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.requireSession(sessionId);
    // Return to default session
    await this.sendUDSRequest(UDS.DIAGNOSTIC_SESSION_CONTROL, Buffer.from([0x01]));
    session.isActive = false;
    this.sessions.delete(sessionId);
    this.emit('sessionEnded', { sessionId });
  }

  async readFirmware(sessionId: string): Promise<Buffer> {
    this.requireSession(sessionId);
    // Send UDS RequestUpload: memory address = 0x00000000, length = 0x10000
    const address = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    const length = Buffer.from([0x00, 0x01, 0x00, 0x00]);
    const uploadReq = Buffer.concat([
      Buffer.from([0x00]), // dataFormatIdentifier
      Buffer.from([0x44]), // addressAndLengthFormatIdentifier (4-byte addr, 4-byte len)
      address,
      length,
    ]);
    await this.sendUDSRequest(UDS.REQUEST_UPLOAD, uploadReq);

    const chunks: Buffer[] = [];
    let blockSeqCounter = 0x01;
    let bytesRead = 0;
    const totalBytes = 0x10000;

    while (bytesRead < totalBytes) {
      const chunkSize = Math.min(this.BLOCK_SIZE, totalBytes - bytesRead);
      const chunk = await this.transferDataBlock(blockSeqCounter, chunkSize);
      chunks.push(chunk);
      bytesRead += chunk.length;
      blockSeqCounter = (blockSeqCounter % 0xFF) + 1;
      this.emit('progress', { operation: 'read', progress: bytesRead / totalBytes });
    }

    await this.sendUDSRequest(UDS.TRANSFER_EXIT, Buffer.alloc(0));
    return Buffer.concat(chunks);
  }

  async writeFirmware(
    sessionId: string,
    firmware: Buffer,
    options: ECUFlashOptions,
  ): Promise<FlashResult> {
    const session = this.requireSession(sessionId);
    const startTime = Date.now();

    let backup: Buffer | undefined;
    if (options.createBackup) {
      backup = await this.readFirmware(session.id);
    }

    // UDS RequestDownload
    const addressBuf = Buffer.from([0x00, 0x00, 0x00, 0x00]);
    const lengthBuf = Buffer.alloc(4);
    lengthBuf.writeUInt32BE(firmware.length, 0);
    const downloadReq = Buffer.concat([
      Buffer.from([0x00]),
      Buffer.from([0x44]),
      addressBuf,
      lengthBuf,
    ]);
    await this.sendUDSRequest(UDS.REQUEST_DOWNLOAD, downloadReq);

    let bytesWritten = 0;
    let blockSeqCounter = 0x01;

    while (bytesWritten < firmware.length) {
      const chunkEnd = Math.min(bytesWritten + this.BLOCK_SIZE, firmware.length);
      const chunk = firmware.slice(bytesWritten, chunkEnd);
      await this.writeDataBlock(blockSeqCounter, chunk);
      bytesWritten = chunkEnd;
      blockSeqCounter = (blockSeqCounter % 0xFF) + 1;

      const progress = bytesWritten / firmware.length;
      options.progressCallback?.(progress);
      this.emit('progress', { operation: 'write', progress });
    }

    await this.sendUDSRequest(UDS.TRANSFER_EXIT, Buffer.alloc(0));

    let crc = this.calculateCRC32(firmware);

    if (options.verifyAfterWrite) {
      const readBack = await this.readFirmware(session.id);
      if (!firmware.equals(readBack)) {
        // Attempt rollback if backup available
        if (backup) {
          await this.writeFirmware(session.id, backup, {
            verifyAfterWrite: false,
            createBackup: false,
          });
        }
        return {
          success: false,
          bytesWritten,
          duration: Date.now() - startTime,
          crc32: crc,
          error: 'Firmware verification failed after write',
        };
      }
    }

    return {
      success: true,
      bytesWritten,
      duration: Date.now() - startTime,
      crc32: crc,
    };
  }

  async getECUInfo(sessionId: string): Promise<ECUInfo> {
    this.requireSession(sessionId);

    // Read software version (0xF189), hardware version (0xF191), calibration ID (0xF180)
    const swVersionBytes = await this.readDataByIdentifier(0xF189);
    const hwVersionBytes = await this.readDataByIdentifier(0xF191);
    const calibIdBytes = await this.readDataByIdentifier(0xF180);
    const ecuIdBytes = await this.readDataByIdentifier(0xF18C);

    return {
      ecuId: this.bytesToAscii(ecuIdBytes),
      name: 'ECU',
      softwareVersion: this.bytesToAscii(swVersionBytes),
      hardwareVersion: this.bytesToAscii(hwVersionBytes),
      calibrationId: this.bytesToAscii(calibIdBytes),
      supported: true,
    };
  }

  async diagnosticSessionControl(sessionId: string, sessionType: number): Promise<Buffer> {
    this.requireSession(sessionId);
    return this.sendUDSRequest(UDS.DIAGNOSTIC_SESSION_CONTROL, Buffer.from([sessionType]));
  }

  async ecuReset(sessionId: string, resetType: number): Promise<Buffer> {
    this.requireSession(sessionId);
    return this.sendUDSRequest(UDS.ECU_RESET, Buffer.from([resetType]));
  }

  async readDataByIdentifier(dataId: number): Promise<Buffer> {
    const idBuf = Buffer.alloc(2);
    idBuf.writeUInt16BE(dataId, 0);
    return this.sendUDSRequest(UDS.READ_DATA_BY_ID, idBuf);
  }

  async writeDataByIdentifier(sessionId: string, dataId: number, data: Buffer): Promise<Buffer> {
    this.requireSession(sessionId);
    const idBuf = Buffer.alloc(2);
    idBuf.writeUInt16BE(dataId, 0);
    return this.sendUDSRequest(UDS.WRITE_DATA_BY_ID, Buffer.concat([idBuf, data]));
  }

  async requestDownload(
    sessionId: string,
    address: number,
    length: number,
  ): Promise<Buffer> {
    this.requireSession(sessionId);
    const req = Buffer.alloc(10);
    req[0] = 0x00; // dataFormatIdentifier
    req[1] = 0x44; // 4-byte addr + 4-byte length
    req.writeUInt32BE(address, 2);
    req.writeUInt32BE(length, 6);
    return this.sendUDSRequest(UDS.REQUEST_DOWNLOAD, req);
  }

  async requestUpload(
    sessionId: string,
    address: number,
    length: number,
  ): Promise<Buffer> {
    this.requireSession(sessionId);
    const req = Buffer.alloc(10);
    req[0] = 0x00;
    req[1] = 0x44;
    req.writeUInt32BE(address, 2);
    req.writeUInt32BE(length, 6);
    return this.sendUDSRequest(UDS.REQUEST_UPLOAD, req);
  }

  async transferData(sessionId: string, blockSeq: number, data: Buffer): Promise<Buffer> {
    this.requireSession(sessionId);
    await this.writeDataBlock(blockSeq, data);
    return Buffer.concat([Buffer.from([UDS.TRANSFER_DATA + 0x40, blockSeq])]);
  }

  /** Calculate CRC-32 checksum */
  calculateCRC32(data: Buffer): number {
    const table = this.buildCRC32Table();
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      crc = (table[(crc ^ byte) & 0xFF] ^ (crc >>> 8)) >>> 0;
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  private buildCRC32Table(): number[] {
    const table: number[] = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      }
      table.push(c >>> 0);
    }
    return table;
  }

  private requireSession(sessionId: string): ECUSession {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error(`ECU session ${sessionId} not found or not active`);
    }
    return session;
  }

  /** Simulated UDS request/response */
  private async sendUDSRequest(service: number, data: Buffer): Promise<Buffer> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 5));
    // Return positive response: service + 0x40 + echo data
    return Buffer.concat([Buffer.from([service + 0x40]), data]);
  }

  private async transferDataBlock(blockSeq: number, size: number): Promise<Buffer> {
    await new Promise((r) => setTimeout(r, 1));
    // Simulate reading 'size' bytes of firmware data
    return Buffer.alloc(size, blockSeq & 0xFF);
  }

  private async writeDataBlock(blockSeq: number, data: Buffer): Promise<void> {
    await new Promise((r) => setTimeout(r, 1));
    void blockSeq;
    void data;
  }

  private bytesToAscii(buf: Buffer): string {
    return buf
      .filter((b) => b > 0x1F && b < 0x7F)
      .reduce((s, b) => s + String.fromCharCode(b), '');
  }
}
