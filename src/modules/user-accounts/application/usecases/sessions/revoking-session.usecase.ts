import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from 'src/modules/user-accounts/infrastructure/sessions.repository';

export class RevokingSessionCommand {
  constructor(public dto: { deviceId: string }) {}
}

@CommandHandler(RevokingSessionCommand)
export class RevokingSessionUseCase
  implements ICommandHandler<RevokingSessionCommand, void>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ dto }: RevokingSessionCommand): Promise<void> {
    await this.sessionsRepository.revokingSessionByDeviceIdOrNotFoundFail(
      dto.deviceId,
    );
  }
}
