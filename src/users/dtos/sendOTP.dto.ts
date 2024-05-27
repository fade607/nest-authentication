import { IsEmail } from 'class-validator';

export class SendOTPEmail {
  @IsEmail()
  email: string;
}
