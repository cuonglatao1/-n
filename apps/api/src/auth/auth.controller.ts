import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, VerifyEmailDto, ResendVerificationDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return {
      success: true,
      data: await this.authService.login(req.user),
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return {
      success: true,
      data: await this.authService.register(registerDto),
    };
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return {
      success: true,
      data: await this.authService.refreshTokens(refreshTokenDto.refreshToken),
    };
  }

  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return {
      success: true,
      data: await this.authService.verifyEmail(verifyEmailDto),
    };
  }

  @Post('resend-verification')
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto) {
    return {
      success: true,
      data: await this.authService.resendVerificationCode(resendVerificationDto),
    };
  }
}
