import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createE2eApp } from './helpers/e2e-app';
import { hasE2eDatabase, configureE2eEnv } from './helpers/e2e-config';
import { registerCustomer } from './helpers/e2e-auth';
import { resetE2eDatabase } from './helpers/e2e-db';

configureE2eEnv();

const describeWithDb = hasE2eDatabase() ? describe : describe.skip;

describeWithDb('App e2e foundation', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const testApp = await createE2eApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  beforeEach(async () => {
    await resetE2eDatabase(prisma);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/v1/health returns ok and request id header', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('x-request-id', 'test-request-id')
      .expect(200);

    expect(response.headers['x-request-id']).toBe('test-request-id');
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        database: 'ok',
        timestamp: expect.any(String),
      }),
    );
  });

  it('GET /api/v1/users/me without token returns standard error envelope', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .expect(401);

    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        statusCode: 401,
        path: '/api/v1/users/me',
        method: 'GET',
        requestId: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
  });

  it('registers, logs in, and returns current user profile', async () => {
    const email = 'customer@example.com';
    const password = 'Str0ngPass!';

    const registered = await registerCustomer(app, { email, password });
    expect(registered.accessToken).toBeDefined();
    expect(registered.refreshToken).toBeDefined();
    expect(registered.user.email).toBe(email);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    expect(loginResponse.body.accessToken).toBeDefined();

    const profileResponse = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);

    expect(profileResponse.body).toEqual(
      expect.objectContaining({
        email,
        firstName: 'Test',
        lastName: 'Customer',
      }),
    );
  });

  it('rejects invalid register payload through global validation', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Bad',
        lastName: 'Payload',
        email: 'not-an-email',
        password: 'short',
        unexpected: true,
      })
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        path: '/api/v1/auth/register',
        method: 'POST',
      }),
    );
  });
});
