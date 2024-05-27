import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
