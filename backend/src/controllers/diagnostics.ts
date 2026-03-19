import { Request, Response } from 'express';
import { DiagnosticService } from '../services/diagnostic';
import { ApiResponse } from '../types';

const diagnosticService = new DiagnosticService();

function ts(): string {
  return new Date().toISOString();
}

export const connect = async (req: Request, res: Response): Promise<void> => {
  const { vehicleId } = req.body as { vehicleId?: string };
  const userId = req.user?.userId ?? '';
  if (!vehicleId) {
    res.status(400).json({ success: false, error: 'vehicleId required', timestamp: ts() });
    return;
  }
  const session = await diagnosticService.startSession(vehicleId, userId);
  const response: ApiResponse<typeof session> = { success: true, data: session, timestamp: ts() };
  res.status(201).json(response);
};

export const getLiveData = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params as { sessionId: string };
  // Set up SSE for live data
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = diagnosticService.startLiveStream(sessionId);

  stream.on('data', (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  stream.on('end', () => {
    res.end();
  });

  req.on('close', () => {
    stream.emit('stop');
  });
};

export const readCodes = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params as { sessionId: string };
  const dtcs = await diagnosticService.readDTCs(sessionId);
  const response: ApiResponse<typeof dtcs> = { success: true, data: dtcs, timestamp: ts() };
  res.status(200).json(response);
};

export const clearCodes = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params as { sessionId: string };
  await diagnosticService.clearDTCs(sessionId);
  const response: ApiResponse<null> = { success: true, message: 'DTCs cleared', timestamp: ts() };
  res.status(200).json(response);
};

export const getFreezeFrame = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params as { sessionId: string };
  const frame = await diagnosticService.readFreezeFrame(sessionId);
  const response: ApiResponse<typeof frame> = { success: true, data: frame, timestamp: ts() };
  res.status(200).json(response);
};

export const disconnect = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params as { sessionId: string };
  await diagnosticService.endSession(sessionId);
  const response: ApiResponse<null> = { success: true, message: 'Session ended', timestamp: ts() };
  res.status(200).json(response);
};
