// import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { emailTemplates } from './email-templates/email-templates';

@Injectable()
export class EmailService {
  //   constructor(private mailerService: MailerService) {}
  //   async sendConfirmationEmail_(email: string, code: string): Promise<void> {
  //     //can add html templates, implement advertising and other logic for mailing...
  //     await this.mailerService.sendMail({
  //       text: `confirm registration via link https://some.com?code=${code}`,
  //     });
  //   }

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    await this.sendEmail(email, code, emailTemplates.registrationEmail);
  }

  async sendRecoveryEmail(email: string, code: string): Promise<void> {
    await this.sendEmail(email, code, emailTemplates.passwordRecoveryEmail);
  }

  private async sendEmail(
    email: string,
    code: string,
    template: (code: string) => string,
  ): Promise<boolean> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'delphinstonefish@gmail.com',
        pass: 'fedhcehyopbmnpxt',
      },
    });

    let info = await transporter.sendMail({
      from: '"Kek 👻" <codeSender>',
      to: email,
      subject: 'Your code is here',
      html: template(code), // html body
    });

    return !!info;
  }
}
