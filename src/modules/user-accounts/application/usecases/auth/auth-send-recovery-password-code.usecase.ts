import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailService } from 'src/modules/mailer/email.service';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/users.repository';
import { UpdateUserDto } from 'src/modules/user-accounts/dto/user/create-user-domain.dto';

export class AuthSendRecoveryPasswordCodeCommand {
  constructor(public dto: UpdateUserDto) {}
}

@CommandHandler(AuthSendRecoveryPasswordCodeCommand)
export class AuthSendRecoveryPasswordCodeUseCase
  implements ICommandHandler<AuthSendRecoveryPasswordCodeCommand>
{
  constructor(
    private readonly emailService: EmailService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({
    dto: { email },
  }: AuthSendRecoveryPasswordCodeCommand): Promise<void> {
    const user =
      await this.usersRepository.findByLoginOrEmailOrNotFoundFail(email);

    const confirmCode = uuidv4() as string;
    const expirationDate = addDays(new Date(), 2); // to env

    user.setPasswordConfirmationCode(confirmCode, expirationDate);

    await this.usersRepository.save(user);

    await this.emailService
      .sendRecoveryEmail(email, confirmCode)
      .catch(console.error);
  }
}
