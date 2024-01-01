import { Injectable } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';

type mailOptions = {
  subject: string;
  email: string;
  name: string;
  activationCode: number;
  template: string;
};

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendMail({
    subject,
    email,
    name,
    activationCode,
    template,
  }: mailOptions) {
    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: {
        name,
        activationCode,
      },
    });
  }
}
