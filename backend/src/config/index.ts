import dotenv from 'dotenv';
dotenv.config();

interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
  mongodbUri: string;
  mongodbTestUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  corsOrigin: string | string[];
  socketPingTimeout: number;
  socketPingInterval: number;
  defaultBaudRate: number;
  defaultProtocol: number;
  connectionTimeout: number;
  responseTimeout: number;
  logLevel: string;
  logDir: string;
  logMaxSize: string;
  logMaxFiles: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, fallback: number): number {
  const value = process.env[key];
  return value !== undefined ? parseInt(value, 10) : fallback;
}

export const config: AppConfig = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: getEnvNumber('PORT', 3000),
  host: getEnv('HOST', '0.0.0.0'),
  mongodbUri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/aiobd'),
  mongodbTestUri: getEnv('MONGODB_TEST_URI', 'mongodb://localhost:27017/aiobd_test'),
  jwtSecret: getEnv('JWT_SECRET', 'change-me-in-production'),
  jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
  jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET', 'change-me-refresh-in-production'),
  jwtRefreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  corsOrigin: getEnv('CORS_ORIGIN', 'http://localhost:5173'),
  socketPingTimeout: getEnvNumber('SOCKET_IO_PING_TIMEOUT', 5000),
  socketPingInterval: getEnvNumber('SOCKET_IO_PING_INTERVAL', 10000),
  defaultBaudRate: getEnvNumber('DEFAULT_BAUD_RATE', 38400),
  defaultProtocol: getEnvNumber('DEFAULT_PROTOCOL', 6),
  connectionTimeout: getEnvNumber('CONNECTION_TIMEOUT', 5000),
  responseTimeout: getEnvNumber('RESPONSE_TIMEOUT', 2000),
  logLevel: getEnv('LOG_LEVEL', 'debug'),
  logDir: getEnv('LOG_DIR', './logs'),
  logMaxSize: getEnv('LOG_MAX_SIZE', '20m'),
  logMaxFiles: getEnv('LOG_MAX_FILES', '14d'),
  rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
  rateLimitMax: getEnvNumber('RATE_LIMIT_MAX', 100),
};
