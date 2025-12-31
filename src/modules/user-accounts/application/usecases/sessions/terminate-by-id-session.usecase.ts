import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DeviceContextDto } from 'src/modules/user-accounts/guards/dto/device-context.dto';
import { SessionsRepository } from 'src/modules/user-accounts/infrastructure/sessions.repository';

export class TerminateByIdCommand {
  constructor(public dto: DeviceContextDto) {}
}

@CommandHandler(TerminateByIdCommand)
export class TerminateByIdUseCase
  implements ICommandHandler<TerminateByIdCommand, void>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ dto }: TerminateByIdCommand): Promise<void> {
    const session = await this.sessionsRepository.findByDeviceIdOrNotFoundFail(
      dto.deviceId,
    );

    if (session.userId !== Number(dto.id)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden error',
      });
    }

    await this.sessionsRepository.deleteByDeviceIdAndUserId(
      Number(dto.id),
      dto.deviceId,
    );
  }
}
