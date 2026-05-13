import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../common/types/authenticated-request';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
      },
    });

    return this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || user.deletedAt || user.suspendedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async refresh(userId: string, refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
    });
    if (!stored || stored.userId !== userId || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt || user.suspendedAt) {
      throw new UnauthorizedException('User not found');
    }

    // rotate: remove old token, issue new pair
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.deletedAt || user.suspendedAt) {
      return { success: true };
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);

    const frontendUrl = this.config.get<string>('FRONTEND_URL');
    const resetUrl = frontendUrl
      ? `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`
      : undefined;

    await this.mail.sendMail({
      to: user.email,
      subject: 'Reset your Hi-Shop password',
      text: resetUrl
        ? `Reset your password using this link: ${resetUrl}`
        : `Use this password reset token: ${token}`,
      html: resetUrl
        ? `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        : `<p>Use this password reset token:</p><p>${token}</p>`,
    });

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt < new Date() ||
      resetToken.user.deletedAt ||
      resetToken.user.suspendedAt
    ) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return { success: true };
  }

  private parseExpiry(expiry: string): Date {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    const date = new Date();
    if (unit === 'd') date.setDate(date.getDate() + value);
    else if (unit === 'h') date.setHours(date.getHours() + value);
    else if (unit === 'm') date.setMinutes(date.getMinutes() + value);
    else if (unit === 's') date.setSeconds(date.getSeconds() + value);
    return date;
  }

  private hashRefreshToken(token: string): string {
    return this.hashToken(token);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(payload: JwtPayload) {
    const accessExpiresIn =
      this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN') ?? '20m';
    const refreshExpiresIn =
      this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN') ?? '7d';

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpiresIn as unknown as number,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn as unknown as number,
    });

    const expiresAt = this.parseExpiry(refreshExpiresIn);
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({ where: { userId: payload.sub } }),
      this.prisma.refreshToken.create({
        data: { userId: payload.sub, token: refreshTokenHash, expiresAt },
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      },
    };
  }
}
