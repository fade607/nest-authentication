import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../model/user.model';
import { EmailOTPVerificationSchema } from '../model/EmailOTPVerification.model';
import { ChangePasswordOTP } from '../model/ChangePasswordOTP.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,

    @InjectModel('ChangePasswordOTPSchema')
    private changePasswordOTPSchema: Model<ChangePasswordOTP>,
    @InjectModel('EmailOTPVerificationSchema')
    private emailVerificationModel: Model<EmailOTPVerificationSchema>,

    private readonly logger: Logger,
  ) {}

  SERVICE: string = UsersService.name;
  async create(email: string, password: string, name: string) {
    const newUser = new this.userModel({ email, password, name });
    await newUser.save();
    this.logger.log(`User created successfully - ${newUser._id}`, this.SERVICE);
    return newUser;
  }

  async find(email: string): Promise<User[]> {
    const user = await this.userModel.find({ email: email });
    return user;
  }

  async findOneById(id: string): Promise<{ email: string; name: string }> {

    const user = await this.userModel.findById(id).select('email name').exec();
    const { email, name } = user.toObject();
    return { email, name };
  }

  async findOneAndUpdatePassword(email: string, password: string) {
    const user = await this.userModel.findOneAndUpdate(
      { email: email },
      { $set: { password: password } },
    );
    return user;
  }
}
