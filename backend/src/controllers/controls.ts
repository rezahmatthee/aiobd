import { Request, Response } from 'express';
import { ActuatorControl, ControlType } from '../controls';
import { LiveControlService } from '../controls/live';
import { ApiResponse } from '../types';

const actuatorControl = new ActuatorControl();
const liveControlService = new LiveControlService();

function ts(): string {
  return new Date().toISOString();
}

export const setActuator = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params as { sessionId: string };
  const { type, value } = req.body as { type?: string; value?: unknown };

  if (!type || !Object.values(ControlType).includes(type as ControlType)) {
    res.status(400).json({ success: false, error: 'Valid control type required', timestamp: ts() });
    return;
  }

  const controlType = type as ControlType;
  let result;

  switch (controlType) {
    case ControlType.FUEL_PUMP:
    case ControlType.EMISSIONS:
      result = controlType === ControlType.FUEL_PUMP
        ? await actuatorControl.setFuelPump(sessionId, Boolean(value))
        : await actuatorControl.setEmissionsControl(sessionId, Boolean(value));
      break;
    case ControlType.IGNITION_TIMING:
      result = await actuatorControl.setIgnitionTiming(sessionId, Number(value));
      break;
    case ControlType.VVT:
      result = await actuatorControl.setVVT(sessionId, Number(value));
      break;
    case ControlType.EGR_VALVE:
      result = await actuatorControl.setEGRValve(sessionId, Number(value));
      break;
    case ControlType.IDLE_SPEED:
      result = await actuatorControl.setIdleSpeed(sessionId, Number(value));
      break;
    default:
      res.status(400).json({ success: false, error: 'Unknown control type', timestamp: ts() });
      return;
  }

  const response: ApiResponse<typeof result> = {
    success: result.success,
    data: result,
    error: result.error,
    timestamp: ts(),
  };
  res.status(result.success ? 200 : 400).json(response);
};

export const getActuatorStatus = async (req: Request, res: Response): Promise<void> => {
  const { sessionId, type } = req.params as { sessionId: string; type: string };

  if (!Object.values(ControlType).includes(type as ControlType)) {
    res.status(400).json({ success: false, error: 'Invalid control type', timestamp: ts() });
    return;
  }

  const status = await actuatorControl.getActuatorStatus(sessionId, type as ControlType);
  const response: ApiResponse<typeof status> = { success: true, data: status, timestamp: ts() };
  res.status(200).json(response);
};

export const startLiveControl = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params as { sessionId: string };
  await liveControlService.startLiveControl(sessionId);
  const response: ApiResponse<null> = {
    success: true,
    message: 'Live control started',
    timestamp: ts(),
  };
  res.status(200).json(response);
};

export const stopLiveControl = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params as { sessionId: string };
  await liveControlService.stopLiveControl(sessionId);
  const response: ApiResponse<null> = {
    success: true,
    message: 'Live control stopped',
    timestamp: ts(),
  };
  res.status(200).json(response);
};

export const adjustLiveParameter = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params as { sessionId: string };
  const { param, value } = req.body as { param?: string; value?: number };

  if (!param || value === undefined) {
    res.status(400).json({ success: false, error: 'param and value required', timestamp: ts() });
    return;
  }

  const result = await liveControlService.adjustParameter(sessionId, param, value);
  const response: ApiResponse<typeof result> = {
    success: result.success,
    data: result,
    timestamp: ts(),
  };
  res.status(result.success ? 200 : 429).json(response);
};
