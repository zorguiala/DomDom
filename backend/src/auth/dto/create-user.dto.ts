import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

/**
 * DTO for user registration
 * Used in AuthController.register
 */
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  isAdmin?: boolean;
}
