import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../model/user.model';
import { JwtModule } from '@nestjs/jwt';
import { JwtMiddleware } from '../jwt.middleware';
import { ConfigService, ConfigModule } from '@nestjs/config';
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
  Logger,
} from '@nestjs/common';
import { EmailOTPVerificationSchema } from '../model/EmailOTPVerification.model';
import { ChangePasswordOTPSchema} from "../model/ChangePasswordOTP.model"
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      {
        name: 'EmailOTPVerificationSchema',
        schema: EmailOTPVerificationSchema,
      },
      {
        name: 'ChangePasswordOTPSchema',
        schema: ChangePasswordOTPSchema,
      },
    ]),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('jwt_secret'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService, Logger],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: '/auth/user-info', method: RequestMethod.ALL },
        { path: '/auth/signout', method: RequestMethod.ALL },
      );
  }
}
