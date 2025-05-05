import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

/**
 * Service responsible for user authentication
 */
@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  /**
   * Validates user credentials
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    console.log(`[AuthenticationService] Starting validation for user: ${username}`);
    const user = await this.userRepository.findOne({ where: { email: username } });
    console.log(
      `[AuthenticationService] Found user:`,
      user ? { id: user.id, email: user.email, isActive: user.isActive } : 'null'
    );

    if (!user) {
      console.log(`[AuthenticationService] User not found: ${username}`);
      return null;
    }

    if (!user.isActive) {
      console.log(`[AuthenticationService] User account is inactive: ${username}`);
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.failedLoginAttempts >= 5) {
      console.log(`[AuthenticationService] Too many failed login attempts for user: ${username}`);
      throw new UnauthorizedException('Too many failed login attempts. Account is locked.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const isPasswordValid = await compare(password, user.password);
    console.log(
      `[AuthenticationService] Password validation result for ${username}: ${isPasswordValid}`
    );

    if (!isPasswordValid) {
      console.log(`[AuthenticationService] Invalid password for user: ${username}`);
      user.failedLoginAttempts += 1;
      await this.userRepository.save(user);
      return null;
    }

    if (user.passwordExpirationDate && new Date() > user.passwordExpirationDate) {
      console.log(`[AuthenticationService] Password expired for user: ${username}`);
      throw new UnauthorizedException('Password has expired');
    }

    console.log(`[AuthenticationService] Resetting failed login attempts for user: ${username}`);
    user.failedLoginAttempts = 0;
    user.lastLoginDate = new Date();
    await this.userRepository.save(user);

    return user;
  }

  /**
   * Generates a JWT token for an authenticated user
   */
  generateToken(user: { email: string; id: string; isAdmin: boolean }) {
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
}
