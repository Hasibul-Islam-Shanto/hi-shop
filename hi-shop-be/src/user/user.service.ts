import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type AuditContext = {
  actorId?: string;
  requestId?: string;
  ipAddress?: string;
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private readonly publicUserSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    isVerified: true,
    suspendedAt: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  } satisfies Prisma.UserSelect;

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isVerified: true,
        suspendedAt: true,
        addresses: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateMe(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        suspendedAt: true,
      },
    });
  }

  async findAllForAdmin(query: AdminUserQueryDto) {
    const { search, email, role, suspended, page = 1, limit = 20 } = query;

    const where: Prisma.UserWhereInput = {
      ...(email && { email }),
      ...(role && { role }),
      ...(suspended !== undefined && {
        suspendedAt: suspended ? { not: null } : null,
      }),
      ...(search && {
        OR: [
          {
            firstName: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
          {
            lastName: { contains: search, mode: Prisma.QueryMode.insensitive },
          },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.publicUserSelect,
      }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneForAdmin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...this.publicUserSelect,
        addresses: true,
        _count: { select: { orders: true, reviews: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateRole(id: string, role: Role, auditContext: AuditContext = {}) {
    const previous = await this.findOneForAdmin(id);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { role },
        select: this.publicUserSelect,
      });
      await this.audit.create(
        {
          ...auditContext,
          action: 'USER_ROLE_UPDATED',
          targetType: 'User',
          targetId: id,
          metadata: {
            previousRole: previous.role,
            newRole: role,
          },
        },
        tx,
      );
      return user;
    });
  }

  async suspend(
    id: string,
    currentUserId: string,
    auditContext: AuditContext = {},
  ) {
    if (id === currentUserId) {
      throw new BadRequestException('Admins cannot suspend their own account');
    }

    const previous = await this.findOneForAdmin(id);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { suspendedAt: new Date() },
        select: this.publicUserSelect,
      });
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await this.audit.create(
        {
          ...auditContext,
          action: 'USER_SUSPENDED',
          targetType: 'User',
          targetId: id,
          metadata: {
            previousSuspendedAt: previous.suspendedAt?.toISOString() ?? null,
            suspendedAt: user.suspendedAt?.toISOString() ?? null,
            refreshTokensRevoked: true,
          },
        },
        tx,
      );
      return user;
    });
  }

  async reactivate(id: string, auditContext: AuditContext = {}) {
    const previous = await this.findOneForAdmin(id);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { suspendedAt: null },
        select: this.publicUserSelect,
      });
      await this.audit.create(
        {
          ...auditContext,
          action: 'USER_REACTIVATED',
          targetType: 'User',
          targetId: id,
          metadata: {
            previousSuspendedAt: previous.suspendedAt?.toISOString() ?? null,
          },
        },
        tx,
      );
      return user;
    });
  }
}
