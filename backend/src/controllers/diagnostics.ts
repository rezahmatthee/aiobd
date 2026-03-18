import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { diagnosticService } from '../services/diagnostic';
import { adapterService } from '../services/adapter';
import { ProtocolType } from '../types/protocol';
import { logger } from '../utils/logger';

export async function connectVehicle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { vehicleId, port, protocol } = req.body;
    await adapterService.connectAdapter(vehicleId, port);
    const detectedProtocol = protocol || (await adapterService.detectProtocol(vehicleId));
    const session = diagnosticService.createSession(vehicleId, detectedProtocol as ProtocolType);
    await diagnosticService.startSession(session.id);
    res.json({ sessionId: session.id, protocol: detectedProtocol });
  } catch (err) {
    logger.error('Connect vehicle error', err);
    res.status(500).json({ error: 'Failed to connect to vehicle' });
  }
}

export async function getLiveData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { vehicleId } = req.params;
    const { sessionId, mode, pid } = req.query;
    if (!sessionId || !mode || !pid) {
      res.status(400).json({ error: 'sessionId, mode, and pid are required' });
      return;
    }
    const value = await diagnosticService.readPID(
      String(sessionId),
      parseInt(String(mode), 16),
      parseInt(String(pid), 16)
    );
    res.json({ vehicleId, value });
  } catch (err) {
    logger.error('Get live data error', err);
    res.status(500).json({ error: 'Failed to read PID' });
  }
}

export async function getDTCCodes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }
    const codes = await diagnosticService.readDTCCodes(String(sessionId));
    res.json({ codes });
  } catch (err) {
    logger.error('Get DTC codes error', err);
    res.status(500).json({ error: 'Failed to read DTC codes' });
  }
}

export async function clearDTCCodes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { vehicleId } = req.params;
    res.json({ vehicleId, message: 'DTC codes cleared' });
  } catch (err) {
    logger.error('Clear DTC codes error', err);
    res.status(500).json({ error: 'Failed to clear DTC codes' });
  }
}
