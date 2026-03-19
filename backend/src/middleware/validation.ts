import { Request, Response, NextFunction } from 'express';

function sendValidationError(res: Response, errors: string[]): void {
  res.status(400).json({
    success: false,
    error: 'Validation failed',
    details: errors,
    timestamp: new Date().toISOString(),
  });
}

/** Validate user registration request body */
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { email, password, firstName, lastName } = req.body as Record<string, unknown>;
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    errors.push('First name is required');
  }
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }
  next();
};

/** Validate user login request body */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { email, password } = req.body as Record<string, unknown>;
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }
  next();
};

/** Validate vehicle creation/update request body */
export const validateVehicle = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { vin, make, model, year, engine, transmission } = req.body as Record<string, unknown>;
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  if (!vin || typeof vin !== 'string' || vin.trim().length !== 17) {
    errors.push('VIN must be exactly 17 characters');
  }
  if (!make || typeof make !== 'string' || make.trim().length === 0) {
    errors.push('Make is required');
  }
  if (!model || typeof model !== 'string' || model.trim().length === 0) {
    errors.push('Model is required');
  }
  if (
    year === undefined ||
    typeof year !== 'number' ||
    !Number.isInteger(year) ||
    year < 1990 ||
    year > currentYear + 2
  ) {
    errors.push(`Year must be an integer between 1990 and ${currentYear + 2}`);
  }
  if (!engine || typeof engine !== 'string' || engine.trim().length === 0) {
    errors.push('Engine is required');
  }
  if (!transmission || typeof transmission !== 'string' || transmission.trim().length === 0) {
    errors.push('Transmission is required');
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }
  next();
};

/** Validate a PID read request */
export const validatePIDRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { pid } = req.body as Record<string, unknown>;
  const errors: string[] = [];

  if (pid === undefined || pid === null) {
    errors.push('PID value is required');
  } else {
    const pidNum = Number(pid);
    if (!Number.isInteger(pidNum) || pidNum < 0 || pidNum > 0xFFFF) {
      errors.push('PID must be an integer between 0 and 65535 (0xFFFF)');
    }
  }

  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }
  next();
};
