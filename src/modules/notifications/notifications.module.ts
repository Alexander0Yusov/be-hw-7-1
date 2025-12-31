import { Module } from '@nestjs/common';
import { MailerModule } from '../mailer/mailer.module';
import { EmailService } from '../mailer/email.service';

@Module({
  imports: [MailerModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
