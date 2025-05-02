import { Controller, Post, Body, UseGuards, Request, Put, Param, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangePasswordDto, ResetPasswordRequestDto } from './dto/password.dto';
import { UserService } from './services/user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  // eslint-disable-next-line @typescript-eslint/require-await
  async login(@Request() req: { user: User }): Promise<{ access_token: string }> {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() userData: CreateUserDto) {
    return this.authService.register(userData);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @Request() req: { user: User },
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    await this.authService.changePassword(
      req.user.id,
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Request() req: { user: User }
  ): Promise<
    | { id: string; email: string; firstName: string; lastName: string; isAdmin: boolean }
    | { error: string }
  > {
    const userId: string = req.user.id;
    const user = await this.userService.getProfile(userId);
    if (!user) {
      return { error: 'User not found' };
    }
    return user;
  }
}
