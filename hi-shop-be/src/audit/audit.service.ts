import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditAction =
  | 'USER_ROLE_UPDATED'
  | 'USER_SUSPENDED'
  | 'USER_REACTIVATED'
  | 'ORDER_STATUS_UPDATED'
  | 'ORDER_SHIPPING_UPDATED'
  | 'INVENTORY_ADJUSTED';

type AuditLogInput = {
  actorId?: string;
  action: AuditAction;
  targetType: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
  requestId?: string;
  ipAddress?: string;
};

type AuditClient = Pick<Prisma.TransactionClient, 'auditLog'>;

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: AuditLogInput, client: AuditClient = this.prisma) {
    return client.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        metadata: input.metadata,
        requestId: input.requestId,
        ipAddress: input.ipAddress,
      },
    });
  }
}
