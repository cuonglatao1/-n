import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { LoginDto, RegisterDto, VerifyEmailDto, ResendVerificationDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user (unverified)
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        isEmailVerified: false,
        settings: {
          create: {
            defaultModel: 'gpt-3.5-turbo',
            maxConcurrentRequests: 3,
            autoSaveInterval: 30000,
            theme: 'system',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification code
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        code: verificationCode,
        email: user.email,
        expiresAt,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationCode(user.email, verificationCode, user.name);

    return {
      message: 'Registration successful. Please check your email for verification code.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token exists in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Remove old refresh token
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      // Generate new tokens
      const { password: _, ...user } = storedToken.user;
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
    } catch (error) {
      // Token might not exist, which is fine
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, code } = verifyEmailDto;

    // Find the verification record
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Mark verification as used
    await this.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { isUsed: true },
    });

    // Update user as verified
    const user = await this.prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    // Return login tokens
    return this.login(user);
  }

  async resendVerificationCode(resendVerificationDto: ResendVerificationDto) {
    const { email } = resendVerificationDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Invalidate existing verification codes
    await this.prisma.emailVerification.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Generate new verification code
    const verificationCode = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store new verification code
    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        code: verificationCode,
        email: user.email,
        expiresAt,
      },
    });

    // Send verification email
    await this.emailService.sendVerificationCode(user.email, verificationCode, user.name);

    return {
      message: 'Verification code sent successfully',
    };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
