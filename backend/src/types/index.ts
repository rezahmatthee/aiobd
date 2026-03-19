export * from './protocol';
export * from './pid';
export * from './diagnostic';

/** Vehicle information */
export interface VehicleInfo {
  vin: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  transmission: string;
}

/** ECU information */
export interface ECUInfo {
  ecuId: string;
  name: string;
  softwareVersion: string;
  hardwareVersion: string;
  calibrationId: string;
  supported: boolean;
}

/** Control command */
export interface ControlCommand {
  command: string;
  parameters: Record<string, unknown>;
  timeout: number;
  requiresAuth: boolean;
}

/** Generic API response */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  timestamp: string;
}

/** JWT auth payload */
export interface AuthPayload {
  userId: string;
  email: string;
  roles: UserRole[];
  iat: number;
  exp: number;
}

/** User roles */
export enum UserRole {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  USER = 'USER',
}
