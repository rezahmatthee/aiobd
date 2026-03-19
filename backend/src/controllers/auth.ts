import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { ApiResponse, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme-secret';

function makeTimestamp(): string {
  return new Date().toISOString();
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, role } = req.body as {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  };

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Email already registered',
      timestamp: makeTimestamp(),
    };
    res.status(409).json(response);
    return;
  }

  const user = new User({
    email: email.toLowerCase(),
    password,
    firstName,
    lastName,
    role: role ?? UserRole.USER,
  });
  await user.save();

  const token = jwt.sign(
    { userId: user.id as string, email: user.email, roles: user.role },
    JWT_SECRET,
    { expiresIn: 86400 },
  );

  const response: ApiResponse<{ token: string; userId: string }> = {
    success: true,
    data: { token, userId: user.id as string },
    message: 'Registration successful',
    timestamp: makeTimestamp(),
  };
  res.status(201).json(response);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid email or password',
      timestamp: makeTimestamp(),
    };
    res.status(401).json(response);
    return;
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid email or password',
      timestamp: makeTimestamp(),
    };
    res.status(401).json(response);
    return;
  }

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    { userId: user.id as string, email: user.email, roles: user.role },
    JWT_SECRET,
    { expiresIn: 86400 },
  );
  const refreshToken = jwt.sign(
    { userId: user.id as string, email: user.email, roles: user.role },
    JWT_SECRET,
    { expiresIn: 604800 },
  );

  const response: ApiResponse<{ token: string; refreshToken: string; userId: string }> = {
    success: true,
    data: { token, refreshToken, userId: user.id as string },
    message: 'Login successful',
    timestamp: makeTimestamp(),
  };
  res.status(200).json(response);
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // Stateless JWT: client discards token; server-side blacklist is out of scope
  const response: ApiResponse<null> = {
    success: true,
    message: 'Logged out successfully',
    timestamp: makeTimestamp(),
  };
  res.status(200).json(response);
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body as { refreshToken?: string };
  if (!token) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Refresh token required',
      timestamp: makeTimestamp(),
    };
    res.status(400).json(response);
    return;
  }

  const payload = jwt.verify(token, JWT_SECRET) as {
    userId: string;
    email: string;
    roles: UserRole;
  };

  const newToken = jwt.sign(
    { userId: payload.userId, email: payload.email, roles: payload.roles },
    JWT_SECRET,
    { expiresIn: 86400 },
  );

  const response: ApiResponse<{ token: string }> = {
    success: true,
    data: { token: newToken },
    message: 'Token refreshed',
    timestamp: makeTimestamp(),
  };
  res.status(200).json(response);
};
