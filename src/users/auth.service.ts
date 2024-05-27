import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailOTPVerificationSchema } from '../model/EmailOTPVerification.model';
import { ChangePasswordOTP } from '../model/ChangePasswordOTP.model';
import { MailService } from '../mail/mail.service';
import * as mongoose from 'mongoose';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private mailService: MailService,

    private jwtService: JwtService,
    @InjectModel('EmailOTPVerificationSchema')
    private emailVerificationModel: Model<EmailOTPVerificationSchema>,
    @InjectModel('ChangePasswordOTPSchema')
    private changePasswordOTPSchema: Model<ChangePasswordOTP>,
  ) {}

  async signup(
    email: string,
    password: string,
    name: string,
    confirmPassword: string,
  ) {
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email is already in use');
    }

    // create salt
    const salt = this.configService.get('salt');

    // hash user password:
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = hash.toString('hex');

    // create new user
    const user = await this.usersService.create(email, result, name);
    const payload = { email: user.email, userId: user._id };
    const accessToken = await this.jwtService.signAsync(payload);
    // return user token
    return accessToken;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const salt = this.configService.get('salt');

    const storedHash = user.password;
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }

    const payload = { email: user.email, userId: user._id };
    const accessToken = await this.jwtService.signAsync(payload);

    return accessToken;
  }

  async createAccountWithOTP(
    email: string,
    password: string,
    name: string,
    confirmPassword: string,
    otp: string,
  ) {
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email is already in use');
    }

    // find user email OTP Verification
    const userOTPInfo = await this.emailVerificationModel.findOne({
      email: email,
    });

    if (!userOTPInfo) {
      throw new BadRequestException('Invalid OTP');
    }

    if (userOTPInfo.otp !== otp) {
      throw new BadRequestException('OTP not matched ');
    }

    const now = new Date();
    if (now > userOTPInfo.expireAt) {
      throw new BadRequestException('OTP has been expired');
    }

    // create salt
    const salt = this.configService.get('salt');

    // hash user password:
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = hash.toString('hex');

    // create new user
    const user = await this.usersService.create(email, result, name);
    const payload = { email: user.email, userId: user._id };
    const accessToken = await this.jwtService.signAsync(payload);
    await this.emailVerificationModel.deleteOne({ email: email });
    // return user token
    return accessToken;
  }

  async sendOTP(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store the OTP in the database

    const user = await this.emailVerificationModel.findOne({ email: email });

    if (!user) {
      // create a new user
      const newUser = new this.emailVerificationModel({
        email: email,
        otp: otp,
        createdAt: new Date(),
        expireAt: new Date(new Date().getTime() + 10 * 60 * 1000),
      });
      await newUser.save();
    } else {
      // update the existing user
      user.otp = otp;
      user.createdAt = new Date();
      user.expireAt = new Date(new Date().getTime() + 10 * 60 * 1000);
      await user.save();
    }

    // Send the OTP to the user's email
    await this.mailService.sendMail(email, 'OTP Verification', otp);
    return { message: 'Email sent successfully' };
  }

  async changePasswordStep1(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store the OTP in the database

    const user = await this.changePasswordOTPSchema.findOne({
      email: email,
    });


    if (!user) {
      // create a new user
      const newUser = new this.changePasswordOTPSchema({
        email: email,
        otp: otp,
        createdAt: new Date(),
        expireAt: new Date(new Date().getTime() + 10 * 60 * 1000),
      });
      await newUser.save();
    } else {
      // update the existing user
      user.otp = otp;
      user.createdAt = new Date();
      user.expireAt = new Date(new Date().getTime() + 10 * 60 * 1000);
      await user.save();
    }

    // Send the OTP to the user's email
    await this.mailService.sendMail(email, 'OTP Verification', otp);
    return { message: 'Email sent successfully' };
  }

  async changePasswordStep2(email: string, newPassword: string, otp: string) {

    const userOTPInfo = await this.changePasswordOTPSchema.findOne({
      email: email,
    });

    if (!userOTPInfo) {
      throw new BadRequestException('Invalid OTP');
    }

    if (userOTPInfo.otp !== otp) {
      throw new BadRequestException('OTP not matched ');
    }

    const now = new Date();
    if (now > userOTPInfo.expireAt) {
      throw new BadRequestException('OTP has been expired');
    }

    const salt = this.configService.get('salt');

    // hash user password:
    const hash = (await scrypt(newPassword, salt, 32)) as Buffer;
    const result = hash.toString('hex');

    const res = await this.usersService.findOneAndUpdatePassword(email, result);

    await this.changePasswordOTPSchema.deleteOne({ email: email });
    return { message: 'Password changed successfully' };
  }
}
