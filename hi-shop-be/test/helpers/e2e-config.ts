export function configureE2eEnv() {
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
  process.env.DATABASE_URL =
    process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
  process.env.JWT_ACCESS_SECRET =
    process.env.JWT_ACCESS_SECRET ??
    'test-access-secret-at-least-32-characters';
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ??
    'test-refresh-secret-at-least-32-characters';
  process.env.ACCESS_TOKEN_EXPIRES_IN =
    process.env.ACCESS_TOKEN_EXPIRES_IN ?? '20m';
  process.env.REFRESH_TOKEN_EXPIRES_IN =
    process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d';
  process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  process.env.DASHBOARD_URL =
    process.env.DASHBOARD_URL ?? 'http://localhost:5173';
}

export function hasE2eDatabase() {
  const databaseUrl = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    return false;
  }

  return process.env.ALLOW_E2E_DB_RESET === 'true' || /test|e2e/i.test(databaseUrl);
}

export function assertSafeE2eDatabase() {
  const databaseUrl = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('E2E_DATABASE_URL or DATABASE_URL is required for e2e tests');
  }

  const allowReset = process.env.ALLOW_E2E_DB_RESET === 'true';
  const looksLikeTestDb = /test|e2e/i.test(databaseUrl);
  if (!allowReset && !looksLikeTestDb) {
    throw new Error(
      'Refusing to reset e2e database. Use a database URL containing "test"/"e2e" or set ALLOW_E2E_DB_RESET=true.',
    );
  }
}
