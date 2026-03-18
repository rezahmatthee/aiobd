import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function getVehicles(req: AuthRequest, res: Response): Promise<void>;
export declare function createVehicle(req: AuthRequest, res: Response): Promise<void>;
export declare function getVehicle(req: AuthRequest, res: Response): Promise<void>;
export declare function deleteVehicle(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=vehicles.d.ts.map