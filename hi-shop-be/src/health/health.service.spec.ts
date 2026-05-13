import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

const createMockPrisma = () => ({
  $queryRaw: jest.fn(),
});

describe('HealthService', () => {
  let service: HealthService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('returns ok when database responds', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('ok');
  });

  it('throws ServiceUnavailableException when database fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('db down'));

    await expect(service.check()).rejects.toThrow(ServiceUnavailableException);
  });
});
