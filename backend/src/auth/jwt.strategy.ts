import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
    /* eslint-enable @typescript-eslint/no-unsafe-call */
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: {
    sub: string;
    email: string;
  }): Promise<{ userId: string; email: string }> {
    return { userId: payload.sub, email: payload.email };
  }
}
