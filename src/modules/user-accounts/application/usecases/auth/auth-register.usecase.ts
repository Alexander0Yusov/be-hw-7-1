import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../users/create-user.usecase';
import { EmailService } from 'src/modules/mailer/email.service';
import { UserInputDto } from 'src/modules/user-accounts/dto/user/user-input.dto';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/users.repository';

export class AuthRegisterCommand {
  constructor(public dto: UserInputDto) {}
}

@CommandHandler(AuthRegisterCommand)
export class AuthRegisterUseCase
  implements ICommandHandler<AuthRegisterCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly emailService: EmailService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute({
    dto: { login, password, email },
  }: AuthRegisterCommand): Promise<void> {
    await this.commandBus.execute(
      new CreateUserCommand({ login, password, email }),
    );

    // этот код дублируется в повт отправке письма и его лучше вынести в сервис?
    const confirmCode = uuidv4() as string;
    const expirationDate = addDays(new Date(), 2); // to env

    const user =
      await this.usersRepository.findByLoginOrEmailOrNotFoundFail(email);

    user.setEmailConfirmationCode(confirmCode, expirationDate);

    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(email, confirmCode)
      .catch(console.error);
  }
}
