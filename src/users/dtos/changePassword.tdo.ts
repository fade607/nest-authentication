import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class changePassword {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  otp: string;

  @IsString()
  confirmPassword: string;

}
