const REQUIRED_ENV_KEYS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
  'DASHBOARD_URL',
] as const;

const PLACEHOLDER_VALUES = new Set([
  'change-me-access',
  'change-me-refresh',
  'your_access_secret_here',
  'your_refresh_secret_here',
]);

function requireNonEmpty(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

function requireUrl(config: Record<string, unknown>, key: string): void {
  const value = requireNonEmpty(config, key);
  try {
    new URL(value);
  } catch {
    throw new Error(`Environment variable ${key} must be a valid URL`);
  }
}

export function validateEnv(config: Record<string, unknown>) {
  for (const key of REQUIRED_ENV_KEYS) {
    requireNonEmpty(config, key);
  }

  requireUrl(config, 'FRONTEND_URL');
  requireUrl(config, 'DASHBOARD_URL');

  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
    const value = requireNonEmpty(config, key);
    if (PLACEHOLDER_VALUES.has(value)) {
      throw new Error(`Environment variable ${key} must not use a placeholder`);
    }
    if (value.length < 32) {
      throw new Error(`Environment variable ${key} must be at least 32 chars`);
    }
  }

  const port = config.SERVER_PORT;
  if (port !== undefined) {
    const parsed = Number(port);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      throw new Error('Environment variable SERVER_PORT must be a valid port');
    }
  }

  return config;
}
