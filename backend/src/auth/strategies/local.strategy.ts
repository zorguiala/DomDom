import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      usernameField: 'username',
    });
  }

  async validate(username: string, password: string): Promise<User> {
    console.log(`[LocalStrategy] Attempting to validate user with username: ${username}`);
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      console.log(`[LocalStrategy] Validation failed for user: ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    console.log(`[LocalStrategy] Successfully validated user: ${username}`);
    return user;
  }
}
