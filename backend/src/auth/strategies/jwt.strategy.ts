import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    /* eslint-enable @typescript-eslint/no-unsafe-call */
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: {
    sub: string;
    email: string;
    isAdmin: boolean;
  }): Promise<{ userId: string; email: string; isAdmin: boolean }> {
    return { userId: payload.sub, email: payload.email, isAdmin: payload.isAdmin };
  }
}
