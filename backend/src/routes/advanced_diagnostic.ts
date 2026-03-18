/**
 * Advanced Diagnostic API Routes
 * Endpoints for Mode $06, Mode $09, and freeze frame operations
 */

import { Router, Request, Response } from 'express';
import { AdvancedDiagnosticService, DiagnosticSession } from '../services/advanced_diagnostic';

const router = Router();

// In-memory store for active services (would be replaced by proper session management)
const activeServices: Map<string, AdvancedDiagnosticService> = new Map();

/**
 * Get or create an AdvancedDiagnosticService for a vehicle
 * In production, this would be retrieved from a session store
 */
function getServiceForVehicle(vehicleId: string): AdvancedDiagnosticService {
  if (!activeServices.has(vehicleId)) {
    // Mock session for development - replace with real session management
    const mockSession: DiagnosticSession = {
      vehicleId,
      connected: true,
      sendRequest: async (_bytes: number[]) => {
        // Mock response - replace with actual OBD2 communication
        return [0x00, 0x00];
      },
    };
    activeServices.set(vehicleId, new AdvancedDiagnosticService(mockSession));
  }
  return activeServices.get(vehicleId)!;
}

/**
 * POST /api/diagnostics/:vehicleId/advanced/monitors
 * Request Mode $06 monitor test data
 */
router.post('/:vehicleId/advanced/monitors', async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const { testId = 0x00 } = req.body;

  const service = getServiceForVehicle(vehicleId);
  const result = await service.requestMonitorTests(testId);

  if (result.success) {
    res.json({ vehicleId, monitors: result.data });
  } else {
    res.status(500).json({ error: result.error });
  }
});

/**
 * GET /api/diagnostics/:vehicleId/advanced/monitors
 * Get cached monitor test data
 */
router.get('/:vehicleId/advanced/monitors', (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  const service = getServiceForVehicle(vehicleId);
  const monitors = service.getCachedMonitorTests();

  if (monitors) {
    res.json({ vehicleId, monitors });
  } else {
    res.status(404).json({ error: 'No monitor data available. Run a monitor request first.' });
  }
});

/**
 * GET /api/diagnostics/:vehicleId/advanced/info
 * Get Mode $09 vehicle information
 */
router.get('/:vehicleId/advanced/info', async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  const service = getServiceForVehicle(vehicleId);

  // Try cached first
  let info = service.getCachedVehicleInfo();
  if (!info) {
    const result = await service.requestVehicleInfo();
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    info = result.data as typeof info;
  }

  res.json({ vehicleId, info });
});

/**
 * GET /api/diagnostics/:vehicleId/advanced/freeze-frames
 * List all freeze frames for a vehicle
 */
router.get('/:vehicleId/advanced/freeze-frames', (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  const service = getServiceForVehicle(vehicleId);
  const frames = service.getFreezeFrames();

  res.json({ vehicleId, freezeFrames: frames });
});

/**
 * GET /api/diagnostics/:vehicleId/advanced/freeze-frames/:frameId
 * Get a specific freeze frame
 */
router.get('/:vehicleId/advanced/freeze-frames/:frameId', (req: Request, res: Response) => {
  const { vehicleId, frameId } = req.params;

  const service = getServiceForVehicle(vehicleId);
  const frame = service.getFreezeFrameById(frameId);

  if (frame) {
    res.json({ vehicleId, freezeFrame: frame });
  } else {
    res.status(404).json({ error: `Freeze frame ${frameId} not found` });
  }
});

/**
 * DELETE /api/diagnostics/:vehicleId/advanced/freeze-frames/:frameId
 * Clear a specific freeze frame
 */
router.delete('/:vehicleId/advanced/freeze-frames/:frameId', (req: Request, res: Response) => {
  const { vehicleId, frameId } = req.params;

  const service = getServiceForVehicle(vehicleId);
  const cleared = service.clearFreezeFrame(frameId);

  if (cleared) {
    res.json({ vehicleId, message: `Freeze frame ${frameId} cleared successfully` });
  } else {
    res.status(404).json({ error: `Freeze frame ${frameId} not found` });
  }
});

export default router;
