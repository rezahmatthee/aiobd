import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function connectVehicle(req: AuthRequest, res: Response): Promise<void>;
export declare function getLiveData(req: AuthRequest, res: Response): Promise<void>;
export declare function getDTCCodes(req: AuthRequest, res: Response): Promise<void>;
export declare function clearDTCCodes(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=diagnostics.d.ts.map