import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/users.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { EmailService } from 'src/modules/mailer/email.service';

export class AuthEmailResendConfirmationCommand {
  constructor(public body: { email: string }) {}
}

@CommandHandler(AuthEmailResendConfirmationCommand)
export class AuthEmailResendConfirmationUseCase
  implements ICommandHandler<AuthEmailResendConfirmationCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute({ body }: AuthEmailResendConfirmationCommand): Promise<void> {
    const user = await this.usersRepository.findByLoginOrEmailOrNotFoundFail(
      body.email,
    );

    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email has been confirmed',
        extensions: [
          {
            field: 'email',
            message: 'Email has been confirmed',
          },
        ],
      });
    }

    const confirmCode = uuidv4() as string;
    const expirationDate = addDays(new Date(), 2); // to env

    user.setEmailConfirmationCode(confirmCode, expirationDate);

    this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(body.email, confirmCode)
      .catch(console.error);
  }
}
