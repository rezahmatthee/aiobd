import { Request, Response } from 'express';
import { ECUManager } from '../ecu';
import { TuningEngine } from '../ecu/tuning';
import { ApiResponse } from '../types';
import { ProtocolType } from '../types';

const ecuManager = new ECUManager();
const tuningEngine = new TuningEngine();

function ts(): string {
  return new Date().toISOString();
}

export const startECUSession = async (req: Request, res: Response): Promise<void> => {
  const { vehicleId, protocol } = req.body as {
    vehicleId?: string;
    protocol?: number;
  };
  if (!vehicleId) {
    res.status(400).json({ success: false, error: 'vehicleId required', timestamp: ts() });
    return;
  }
  const session = await ecuManager.startSession(
    vehicleId,
    (protocol as ProtocolType) ?? ProtocolType.AUTO,
  );
  const response: ApiResponse<typeof session> = { success: true, data: session, timestamp: ts() };
  res.status(201).json(response);
};

export const endECUSession = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  await ecuManager.endSession(id);
  const response: ApiResponse<null> = { success: true, message: 'ECU session ended', timestamp: ts() };
  res.status(200).json(response);
};

export const readFirmware = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const firmware = await ecuManager.readFirmware(id);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="firmware-${id}.bin"`);
  res.status(200).send(firmware);
};

export const writeFirmware = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const { verifyAfterWrite = true, createBackup = true } = req.body as {
    verifyAfterWrite?: boolean;
    createBackup?: boolean;
  };

  // Expect firmware binary in request body
  const firmware: Buffer = req.body instanceof Buffer ? req.body : Buffer.from([]);
  if (firmware.length === 0) {
    res.status(400).json({ success: false, error: 'Firmware data required', timestamp: ts() });
    return;
  }

  const result = await ecuManager.writeFirmware(id, firmware, {
    verifyAfterWrite,
    createBackup,
  });
  const response: ApiResponse<typeof result> = {
    success: result.success,
    data: result,
    error: result.error,
    timestamp: ts(),
  };
  res.status(result.success ? 200 : 500).json(response);
};

export const getECUInfo = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const info = await ecuManager.getECUInfo(id);
  const response: ApiResponse<typeof info> = { success: true, data: info, timestamp: ts() };
  res.status(200).json(response);
};

export const applyTuning = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const { param, value } = req.body as { param?: string; value?: number };
  if (!param || value === undefined) {
    res.status(400).json({ success: false, error: 'param and value required', timestamp: ts() });
    return;
  }
  await tuningEngine.applyRealTimeAdjustment(param, value);
  void id;
  const response: ApiResponse<{ param: string; value: number }> = {
    success: true,
    data: { param, value },
    message: 'Tuning applied',
    timestamp: ts(),
  };
  res.status(200).json(response);
};
