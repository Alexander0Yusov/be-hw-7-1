import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from 'src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { Session } from 'src/modules/user-accounts/domain/session/session.entity';
import { CreateSessionDomainDto } from 'src/modules/user-accounts/dto/session/create-session-domain.dto';
import { JwtRefreshPayload } from 'src/modules/user-accounts/dto/session/jwt-refresh-payload.dto';
import { SessionInputDto } from 'src/modules/user-accounts/dto/session/session-input.dto';
import { SessionsRepository } from 'src/modules/user-accounts/infrastructure/sessions.repository';

export class CreateSessionCommand {
  constructor(public dto: SessionInputDto) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand, void>
{
  constructor(
    // @InjectModel(Session.name)
    // private SessionModel: any, // SessionModelType,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ dto }: CreateSessionCommand): Promise<void> {
    const { id, deviceId, iat, exp } = (await this.refreshTokenContext.decode(
      dto.refreshToken,
    )) as unknown as JwtRefreshPayload;

    const session = Session.createInstance({
      deviceId: deviceId,
      userId: Number(id),
      ip: dto.ip,
      deviceName: dto.deviceName,
      expiresAt: new Date(exp * 1000),
      lastActiveDate: new Date(iat * 1000),
      isRevoked: false,
    });

    await this.sessionsRepository.save(session);
  }
}
