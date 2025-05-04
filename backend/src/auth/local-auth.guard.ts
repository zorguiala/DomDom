import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);

  canActivate(context: ExecutionContext) {
    this.logger.debug('LocalAuthGuard: Attempting to authenticate request');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('LocalAuthGuard:', user);
    if (err || !user) {
      this.logger.error(
        `LocalAuthGuard: Authentication failed - ${err?.message || info?.message || 'Unknown error'}`
      );
      throw err || new Error(info?.message || 'Authentication failed');
    }
    this.logger.debug('LocalAuthGuard: Authentication successful');
    return user;
  }
}
