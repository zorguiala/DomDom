import { Controller, Post, Body, UseGuards, Request, Put, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto, ResetPasswordRequestDto } from './dto/password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<{ access_token: string }> {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() userData: any) {
    return this.authService.register(userData);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(
      req.user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
    return { message: 'Password changed successfully' };
  }

  @Post('reset-password-request')
  async resetPasswordRequest(@Body() resetPasswordDto: ResetPasswordRequestDto) {
    await this.authService.resetPassword(resetPasswordDto.email);
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('unlock-account/:userId')
  async unlockAccount(@Param('userId') userId: string) {
    await this.authService.unlockAccount(userId);
    return { message: 'Account unlocked successfully' };
  }
}
