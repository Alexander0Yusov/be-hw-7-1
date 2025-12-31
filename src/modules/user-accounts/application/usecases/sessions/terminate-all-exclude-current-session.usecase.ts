import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceContextDto } from 'src/modules/user-accounts/guards/dto/device-context.dto';
import { SessionsRepository } from 'src/modules/user-accounts/infrastructure/sessions.repository';

export class TerminateAllExcludeCurrentSessionCommand {
  constructor(public dto: DeviceContextDto) {}
}

@CommandHandler(TerminateAllExcludeCurrentSessionCommand)
export class TerminateAllExcludeCurrentSessionUseCase
  implements ICommandHandler<TerminateAllExcludeCurrentSessionCommand, void>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({
    dto,
  }: TerminateAllExcludeCurrentSessionCommand): Promise<void> {
    await this.sessionsRepository.deleteManyExceptCurrent(
      Number(dto.id),
      dto.deviceId,
    );
  }
}
