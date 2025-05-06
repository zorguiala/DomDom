/* eslint-disable no-useless-escape */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { compare, hash } from 'bcrypt';

/**
 * Service responsible for password management operations
 */
@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * Validates password strength against security requirements
   */
  validatePassword(password: string): void {
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

  /**
   * Changes a user's password after validating current password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password strength
    this.validatePassword(newPassword);

    // Update password and expiration date
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    user.password = await hash(newPassword, 10);
    user.passwordExpirationDate = new Date();
    user.passwordExpirationDate.setMonth(user.passwordExpirationDate.getMonth() + 6);
    user.lastPasswordChangeDate = new Date();
    user.failedLoginAttempts = 0;

    await this.userRepository.save(user);
  }

  /**
   * Resets a user's password and generates a temporary one
   */
  async resetPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal that the email doesn't exist for security reasons
      return;
    }

    // Generate a temporary password
    const temporaryPassword = this.generateTemporaryPassword();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    user.password = await hash(temporaryPassword, 10);
    user.passwordExpirationDate = new Date();
    user.passwordExpirationDate.setHours(user.passwordExpirationDate.getHours() + 24);
    user.failedLoginAttempts = 0;

    await this.userRepository.save(user);

    // In a real implementation, send email with temporaryPassword
    console.log(`Temporary password for ${email}: ${temporaryPassword}`);
  }

  /**
   * Unlocks a user account by resetting failed login attempts
   */
  async unlockAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.failedLoginAttempts = 0;
    await this.userRepository.save(user);
  }

  /**
   * Generates a secure temporary password
   */
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
