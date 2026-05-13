import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuthService } from './auth.service';

// ─── Shared Fixtures ─────────────────────────────────────────────────────────

const mockUser = {
  id: 'user-uuid',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  passwordHash: 'hashed-password',
  role: 'CUSTOMER' as const,
  deletedAt: null,
};

// ─── Mock Factories ───────────────────────────────────────────────────────────

const createMockPrisma = () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  passwordResetToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn((operations: Promise<unknown>[]) =>
    Promise.all(operations),
  ),
});

const createMockJwt = () => ({
  signAsync: jest.fn().mockResolvedValue('signed-token'),
});

const createMockConfig = () => ({
  get: jest.fn().mockReturnValue('7d'),
  getOrThrow: jest.fn().mockReturnValue('secret'),
});

const createMockMail = () => ({
  sendMail: jest.fn(),
});

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createMockPrisma>;
  let jwt: ReturnType<typeof createMockJwt>;
  let mail: ReturnType<typeof createMockMail>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    jwt = createMockJwt();
    mail = createMockMail();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: createMockConfig() },
        { provide: MailService, useValue: mail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Str0ngPass!',
    };

    it('creates user and returns tokens on success', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
          }),
        }),
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockUser.email);
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          token: sha256('signed-token'),
        }),
      });
    });

    it('throws ConflictException when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('hashes password before storing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({});

      const spyHash = jest.spyOn(bcrypt, 'hash');
      await service.register(dto);

      expect(spyHash).toHaveBeenCalledWith(dto.password, 10);
    });
  });

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'john@example.com', password: 'Str0ngPass!' };

    it('returns tokens on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({});
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('throws UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for soft-deleted user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── refresh ───────────────────────────────────────────────────────────────

  describe('refresh', () => {
    const storedToken = {
      id: 'token-uuid',
      userId: mockUser.id,
      token: 'valid-refresh-token',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    };

    it('rotates tokens on valid refresh token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(storedToken);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.refreshToken.delete.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh(mockUser.id, storedToken.token);

      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: sha256(storedToken.token) },
      });
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: storedToken.id },
      });
      expect(result).toHaveProperty('accessToken');
    });

    it('throws UnauthorizedException when token not found', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refresh(mockUser.id, 'invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token belongs to different user', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...storedToken,
        userId: 'different-user-id',
      });

      await expect(
        service.refresh(mockUser.id, storedToken.token),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when token is expired', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...storedToken,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.refresh(mockUser.id, storedToken.token),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('deletes all refresh tokens for user', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.logout(mockUser.id);

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
      expect(result).toEqual({ success: true });
    });
  });

  // ─── password reset ───────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('creates a reset token and sends mail for active user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.passwordResetToken.updateMany.mockResolvedValue({ count: 0 });
      prisma.passwordResetToken.create.mockResolvedValue({});

      const result = await service.forgotPassword({ email: mockUser.email });

      expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, usedAt: null },
        data: { usedAt: expect.any(Date) },
      });
      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      });
      expect(mail.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: mockUser.email }),
      );
      expect(result).toEqual({ success: true });
    });

    it('does not reveal unknown emails', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'none@example.com' });

      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(mail.sendMail).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('resetPassword', () => {
    const resetToken = {
      id: 'reset-uuid',
      userId: mockUser.id,
      tokenHash: sha256('reset-token'),
      expiresAt: new Date(Date.now() + 1000 * 60),
      usedAt: null,
      user: mockUser,
    };

    it('updates password, marks token used, and revokes refresh tokens', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue(resetToken);
      prisma.user.update.mockResolvedValue({});
      prisma.passwordResetToken.update.mockResolvedValue({});
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.resetPassword({
        token: 'reset-token',
        password: 'NewStr0ngPass!',
      });

      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: sha256('reset-token') },
        include: { user: true },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { passwordHash: expect.any(String) },
      });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
      expect(result).toEqual({ success: true });
    });

    it('rejects expired reset token', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        ...resetToken,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.resetPassword({
          token: 'reset-token',
          password: 'NewStr0ngPass!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
