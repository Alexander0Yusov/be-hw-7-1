import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/users.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class AuthEmailConfirmationCommand {
  constructor(public body: { code: string }) {}
}

@CommandHandler(AuthEmailConfirmationCommand)
export class AuthEmailConfirmationUseCase
  implements ICommandHandler<AuthEmailConfirmationCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ body }: AuthEmailConfirmationCommand): Promise<void> {
    try {
      const user =
        await this.usersRepository.getUserAndEmailConfirmationDataByCodeOrNotFounFail(
          body.code,
        );

      if (!user.emailConfirmation.isConfirmed) {
        user.setEmailIsConfirmed();

        await this.usersRepository.save(user);
      }
    } catch (er) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Something wrong with code',
        extensions: [
          {
            field: 'code',
            message:
              'The confirmation code is incorrect, expired or already been applied',
          },
        ],
      });
    }
  }
}
