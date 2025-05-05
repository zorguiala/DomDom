/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../entities/user.entity';

/**
 * Custom decorator to extract user information from the request object.
 * Can be used to get the entire user object or a specific property.
 *
 * @example
 * ```
 * // Get entire user object
 * @GetUser() user: User
 *
 * // Get specific property (e.g., id)
 * @GetUser('id') userId: string
 * ```
 */

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): User | string | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // If data is provided, return the specified property
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return user[data as keyof User];
    }

    // Otherwise, return the entire user object

    return user as User;
  }
);
