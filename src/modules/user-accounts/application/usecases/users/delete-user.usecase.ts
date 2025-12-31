import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from 'src/modules/user-accounts/infrastructure/users.repository';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';

export class DeleteUserCommand {
  constructor(public dto: UserContextDto) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase
  implements ICommandHandler<DeleteUserCommand, void>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute({ dto: { id } }: DeleteUserCommand): Promise<void> {
    await this.usersRepository.softDeleteById(Number(id));
  }
}
