import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';

const createMockPrisma = () => ({
  auditLog: { create: jest.fn() },
});

describe('AuditService', () => {
  let service: AuditService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('creates audit log entry', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-uuid' });

    await service.create({
      actorId: 'admin-uuid',
      action: 'USER_SUSPENDED',
      targetType: 'User',
      targetId: 'user-uuid',
      metadata: { reason: 'fraud' },
      requestId: 'req-1',
      ipAddress: '127.0.0.1',
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: 'admin-uuid',
        action: 'USER_SUSPENDED',
        targetType: 'User',
        targetId: 'user-uuid',
        metadata: { reason: 'fraud' },
        requestId: 'req-1',
        ipAddress: '127.0.0.1',
      },
    });
  });
});
