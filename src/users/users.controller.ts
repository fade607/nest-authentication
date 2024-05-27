import {
  Controller,
  Body,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  Session,
  Req,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/loginUserDto';
import { Request } from 'express';
import { MailService } from '../mail/mail.service';
import { SendOTPEmail } from './dtos/sendOTP.dto';
import { CreateUserWithOTPDto } from './dtos/create-user-withOTP.dto';
import { EmailOTPVerificationSchema } from '../model/EmailOTPVerification.model';
import { Model } from 'mongoose';
import { changePassword } from './dtos/changePassword.tdo';

@Controller('auth')
// @Seriakize(UserDTO)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private readonly logger: Logger,
    private mailService: MailService,
  ) {}

  SERVICE: string = UsersService.name;

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.authService.signup(
      body.email,
      body.password,
      body.name,
      body.confirmPassword,
    );
    this.logger.log(`New User Create an account - ${body.email}`, this.SERVICE);

    return user;
  }

  @Post('/create-account-with-otp')
  async createAccountWithOTP(@Body() body: CreateUserWithOTPDto) {
    const res = await this.authService.createAccountWithOTP(
      body.email,
      body.password,
      body.name,
      body.confirmPassword,
      body.otp,
    );

    this.logger.log(
      `New User Create an account with OTP - ${body.email}`,
      this.SERVICE,
    );

    return res;
  }

  @Post('/signin')
  async signin(@Body() body: LoginUserDto) {
    const user = await this.authService.signin(body.email, body.password);
    this.logger.log(` User signin - ${body.email}`, this.SERVICE);
    return user;
  }

  @Get('/user-info')
  async getUserInfo(@Req() req: Request) {
    const userId = req['user'].id;
    const user = await this.userService.findOneById(userId);
    this.logger.log(` User request Information - ${userId}`, this.SERVICE);
    return user;
  }

  @Post('/send-otp')
  async sendOTP(@Body() body: SendOTPEmail) {
    await this.authService.sendOTP(body.email);
    this.logger.log(`User request to send OTP - ${body.email}`);

    return { message: 'OTP sent successfully' };
  }

  @Post('/signout')
  async signout(@Req() req: Request) {
    const userId = req['user'].id;
    this.logger.log(`User signout  - ${userId}`, this.SERVICE);
    return { message: 'Signout successfully' };
  }

  @Post('/change-password/step1')
  async changePasswordStep1(@Body() body: SendOTPEmail) {
    const [user] = await this.userService.find(body.email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    await this.authService.changePasswordStep1(body.email);
    this.logger.log(
      `User request OTP for change password - ${body.email}`,
      this.SERVICE,
    );
    return { message: 'OTP sent successfully' };
  }

  @Post('/change-password/step2')
  async changePasswordStep2(@Body() body: changePassword) {
    if (body.password !== body.confirmPassword) {
      return { message: 'password does not match' };
    }

    await this.authService.changePasswordStep2(
      body.email,
      body.password,
      body.otp,
    );
    this.logger.log(
      `User request to update the password - ${body.email}`,
      this.SERVICE,
    );
    return { message: 'OTP sent successfully' };
  }
}
