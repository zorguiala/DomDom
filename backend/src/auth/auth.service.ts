/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { compare, hash } from 'bcrypt';

interface LoginUser {
  email: string;
  id: string;
  isAdmin: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    console.log(`[AuthService] Starting validation for user: ${username}`);
    const user = await this.userRepository.findOne({ where: { email: username } });
    console.log(
      `[AuthService] Found user:`,
      user ? { id: user.id, email: user.email, isActive: user.isActive } : 'null'
    );

    if (!user) {
      console.log(`[AuthService] User not found: ${username}`);
      return null;
    }

    if (!user.isActive) {
      console.log(`[AuthService] User account is inactive: ${username}`);
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.failedLoginAttempts >= 5) {
      console.log(`[AuthService] Too many failed login attempts for user: ${username}`);
      throw new UnauthorizedException('Too many failed login attempts. Account is locked.');
    }

    const isPasswordValid = await compare(password, user.password);
    console.log(`[AuthService] Password validation result for ${username}: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(`[AuthService] Invalid password for user: ${username}`);
      user.failedLoginAttempts += 1;
      await this.userRepository.save(user);
      return null;
    }

    if (user.passwordExpirationDate && new Date() > user.passwordExpirationDate) {
      console.log(`[AuthService] Password expired for user: ${username}`);
      throw new UnauthorizedException('Password has expired');
    }

    console.log(`[AuthService] Resetting failed login attempts for user: ${username}`);
    user.failedLoginAttempts = 0;
    user.lastLoginDate = new Date();
    await this.userRepository.save(user);

    return user;
  }

  login(user: LoginUser) {
    const payload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    // Validate password strength
    if (!userData.password) {
      throw new BadRequestException('Password is required');
    }
    this.validatePassword(userData.password);

    // Set password expiration date (6 months from now)
    const passwordExpirationDate = new Date();
    passwordExpirationDate.setMonth(passwordExpirationDate.getMonth() + 6);

    const user = this.userRepository.create({
      ...userData,
      passwordExpirationDate,
      lastPasswordChangeDate: new Date(),
      isActive: true,
      failedLoginAttempts: 0,
    });

    return this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password strength
    this.validatePassword(newPassword);

    // Update password and expiration date

    user.password = await hash(newPassword, 10);
    user.passwordExpirationDate = new Date();
    user.passwordExpirationDate.setMonth(user.passwordExpirationDate.getMonth() + 6);
    user.lastPasswordChangeDate = new Date();
    user.failedLoginAttempts = 0;

    await this.userRepository.save(user);
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal that the email doesn't exist for security reasons
      return;
    }

    // In a real implementation, you would:
    // 1. Generate a password reset token
    // 2. Store it in the database with an expiry time
    // 3. Send an email to the user with a link containing the token

    // For demo purposes, we'll just reset the password to a temporary one
    const temporaryPassword = this.generateTemporaryPassword();
    user.password = await hash(temporaryPassword, 10);
    user.passwordExpirationDate = new Date();
    user.passwordExpirationDate.setHours(user.passwordExpirationDate.getHours() + 24);
    user.failedLoginAttempts = 0;

    await this.userRepository.save(user);

    // In a real implementation, send email with temporaryPassword
    console.log(`Temporary password for ${email}: ${temporaryPassword}`);
  }

  async unlockAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.failedLoginAttempts = 0;
    await this.userRepository.save(user);
  }

  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  private generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
}
