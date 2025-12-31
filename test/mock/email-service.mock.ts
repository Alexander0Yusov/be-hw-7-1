import { EmailService } from '../../src/modules/mailer/email.service';

// export class EmailServiceMock extends EmailService {
//   //override method
//   async sendConfirmationEmail(email: string, code: string): Promise<void> {
//     console.log('Call mock method sendConfirmationEmail / EmailServiceMock');

//     return;
//   }
// }

export class EmailServiceMock extends EmailService {
  static sendConfirmationEmailMock = jest.fn();
  static sendRecoveryEmailMock = jest.fn();

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    console.log('MOCK CALLED: sendConfirmationEmail');
    return EmailServiceMock.sendConfirmationEmailMock(email, code);
  }

  async sendRecoveryEmail(email: string, code: string): Promise<void> {
    return EmailServiceMock.sendRecoveryEmailMock(email, code);
  }
}
