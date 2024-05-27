import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserWithOTPDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*\d).+$/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/, {
    message: 'Password must contain at least one special case character',
  })
  password: string;

  @IsString()
  confirmPassword: string;
  @IsString()
  name: string;

  @IsString()
  otp: string;
}
