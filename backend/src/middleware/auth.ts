import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme-secret';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/** Require a valid JWT Bearer token */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided', timestamp: new Date().toISOString() });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token', timestamp: new Date().toISOString() });
  }
};

/** Require authenticated user to have at least one of the specified roles */
export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated', timestamp: new Date().toISOString() });
      return;
    }
    if (!roles.includes(req.user.roles as unknown as UserRole)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions', timestamp: new Date().toISOString() });
      return;
    }
    next();
  };

/** Attach user to request if token present, but don't require it */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      req.user = jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
};
