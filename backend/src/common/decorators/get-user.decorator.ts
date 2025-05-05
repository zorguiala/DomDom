import { createParamDecorator, ExecutionContext } from '@nestjs/common';

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
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    if (!request.user) {
      return null;
    }
    
    // If data is provided, return the specified property
    if (data) {
      return request.user[data];
    }
    
    // Otherwise, return the entire user object
    return request.user;
  },
); 