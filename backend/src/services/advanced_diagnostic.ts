/**
 * Advanced Diagnostic Service
 * Handles Mode $06, Mode $09, and freeze frame operations
 */

import { MonitorTestResult, buildMode06Request, parseMode06Response } from '../pids/advanced/mode_06';
import {
  VehicleInfo,
  VehicleInfoType,
  buildMode09Request,
  assembleVehicleInfo,
} from '../pids/advanced/mode_09';
import {
  FreezeFrame,
  buildFreezeFrameRequest,
  parseFreezeFrameResponse,
} from '../pids/advanced/freeze_frames';
import { decodeMode06Responses, decodeMode09Responses, decodeFreezeFrameResponse } from '../utils/advanced_parser';

export interface DiagnosticSession {
  vehicleId: string;
  connected: boolean;
  sendRequest: (bytes: number[]) => Promise<number[]>;
}

export interface AdvancedDiagnosticResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export class AdvancedDiagnosticService {
  private session: DiagnosticSession;
  private monitorCache: Map<string, MonitorTestResult[]> = new Map();
  private vehicleInfoCache: Map<string, VehicleInfo> = new Map();
  private freezeFrames: Map<string, FreezeFrame[]> = new Map();

  constructor(session: DiagnosticSession) {
    this.session = session;
  }

  /**
   * Request Mode $06 (On-board Monitor Test Results)
   * @param testId - Specific test ID, or 0x00 for all
   */
  async requestMonitorTests(testId = 0x00): Promise<AdvancedDiagnosticResult> {
    if (!this.session.connected) {
      return { success: false, error: 'No active diagnostic session' };
    }

    try {
      const requestBytes = buildMode06Request(testId);
      const responseBytes = await this.session.sendRequest(requestBytes);

      // Parse all monitor test results from response
      const tests: MonitorTestResult[] = [];
      let offset = 0;

      while (offset + 7 < responseBytes.length) {
        const testBytes = responseBytes.slice(offset, offset + 8);
        const result = parseMode06Response(testBytes);
        if (result) {
          tests.push(result);
        }
        offset += 8;
      }

      // Cache the results
      this.monitorCache.set(this.session.vehicleId, tests);

      return { success: true, data: tests };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request monitor tests',
      };
    }
  }

  /**
   * Get cached monitor test results
   */
  getCachedMonitorTests(): MonitorTestResult[] | null {
    return this.monitorCache.get(this.session.vehicleId) || null;
  }

  /**
   * Request Mode $09 (Vehicle Information)
   * Requests VIN, calibration ID, CVN, and ECU name
   */
  async requestVehicleInfo(): Promise<AdvancedDiagnosticResult> {
    if (!this.session.connected) {
      return { success: false, error: 'No active diagnostic session' };
    }

    try {
      const infoTypes = [
        VehicleInfoType.VIN,
        VehicleInfoType.CALIBRATION_ID,
        VehicleInfoType.CVN,
        VehicleInfoType.ECU_NAME,
      ];

      const responses = new Map<number, number[]>();

      for (const infoType of infoTypes) {
        try {
          const requestBytes = buildMode09Request(infoType);
          const responseBytes = await this.session.sendRequest(requestBytes);
          responses.set(infoType, responseBytes);
        } catch {
          // Continue if individual info type fails
        }
      }

      const vehicleInfo = assembleVehicleInfo(responses);
      this.vehicleInfoCache.set(this.session.vehicleId, vehicleInfo);

      return { success: true, data: vehicleInfo };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request vehicle info',
      };
    }
  }

  /**
   * Get cached vehicle info
   */
  getCachedVehicleInfo(): VehicleInfo | null {
    return this.vehicleInfoCache.get(this.session.vehicleId) || null;
  }

  /**
   * Capture current freeze frame for a given DTC
   * @param dtc - DTC code associated with the freeze frame
   */
  async captureFreezeFrame(dtc: string): Promise<AdvancedDiagnosticResult> {
    if (!this.session.connected) {
      return { success: false, error: 'No active diagnostic session' };
    }

    try {
      const frameId = `${this.session.vehicleId}-${Date.now()}`;
      const allPIDs = [0x04, 0x05, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11];
      const frameBytes: number[] = [];

      // Request each PID in freeze frame context (Mode $02)
      for (const pid of allPIDs) {
        try {
          const requestBytes = buildFreezeFrameRequest(pid, 0);
          const responseBytes = await this.session.sendRequest(requestBytes);
          frameBytes.push(pid, ...responseBytes.slice(0, 2)); // pid + up to 2 data bytes
        } catch {
          // Skip PIDs that fail
        }
      }

      const freezeFrame = parseFreezeFrameResponse(this.session.vehicleId, frameId, frameBytes);
      if (!freezeFrame) {
        return { success: false, error: 'Failed to parse freeze frame data' };
      }

      // Override DTC with provided value
      const frameWithDTC = { ...freezeFrame, dtc };

      // Store freeze frame
      const existingFrames = this.freezeFrames.get(this.session.vehicleId) || [];
      existingFrames.push(frameWithDTC);
      this.freezeFrames.set(this.session.vehicleId, existingFrames);

      return { success: true, data: frameWithDTC };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture freeze frame',
      };
    }
  }

  /**
   * Get all freeze frames for the current vehicle
   */
  getFreezeFrames(): FreezeFrame[] {
    return this.freezeFrames.get(this.session.vehicleId) || [];
  }

  /**
   * Get a specific freeze frame by ID
   */
  getFreezeFrameById(frameId: string): FreezeFrame | null {
    const frames = this.getFreezeFrames();
    return frames.find((f) => f.frameId === frameId) || null;
  }

  /**
   * Clear a specific freeze frame by ID
   */
  clearFreezeFrame(frameId: string): boolean {
    const frames = this.freezeFrames.get(this.session.vehicleId) || [];
    const filtered = frames.filter((f) => f.frameId !== frameId);
    if (filtered.length === frames.length) return false;
    this.freezeFrames.set(this.session.vehicleId, filtered);
    return true;
  }

  /**
   * Parse monitor test results from hex strings (for testing/replay)
   */
  parseMonitorTestsFromHex(hexResponses: string[]): MonitorTestResult[] {
    return decodeMode06Responses(hexResponses);
  }

  /**
   * Parse vehicle info from hex strings (for testing/replay)
   */
  parseVehicleInfoFromHex(hexResponses: string[]): Partial<VehicleInfo> {
    return decodeMode09Responses(hexResponses);
  }

  /**
   * Parse freeze frame from hex string (for testing/replay)
   */
  parseFreezeFrameFromHex(frameId: string, hexResponse: string): FreezeFrame | null {
    return decodeFreezeFrameResponse(this.session.vehicleId, frameId, hexResponse);
  }
}
