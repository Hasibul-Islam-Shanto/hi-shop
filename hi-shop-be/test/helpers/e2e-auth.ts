import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string };
};

export async function registerCustomer(
  app: INestApplication,
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }> = {},
): Promise<AuthTokens> {
  const email = overrides.email ?? `customer-${Date.now()}@example.com`;
  const password = overrides.password ?? 'Str0ngPass!';
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({
      firstName: overrides.firstName ?? 'Test',
      lastName: overrides.lastName ?? 'Customer',
      email,
      password,
    })
    .expect(201);

  return response.body as AuthTokens;
}
