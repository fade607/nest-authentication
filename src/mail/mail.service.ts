import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(
    receiverEmail: string,
    subject: string,
    OTP: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: receiverEmail,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: subject,
      template: './sendOtp',
      context: {
        OTP,
      },
    });
  }
}
