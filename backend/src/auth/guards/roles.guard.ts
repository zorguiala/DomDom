import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */

    if (!user) {
      return false;
    }

    const userEntity = user as User;
    if (!userEntity.role) {
      return false;
    }

    return requiredRoles.includes(userEntity.role);
  }
}
