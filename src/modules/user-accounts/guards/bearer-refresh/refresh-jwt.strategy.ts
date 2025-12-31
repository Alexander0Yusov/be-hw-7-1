import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { CoreConfig } from 'src/core/core.config';
import { Request } from 'express';
import { DeviceContextDto } from '../dto/device-context.dto';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { JwtRefreshPayload } from '../../dto/session/jwt-refresh-payload.dto';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly coreConfig: CoreConfig,
    private readonly sessionsRepository: SessionsRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refreshToken || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: coreConfig.refreshTokenSecret,
    });
  }

  async validate(payload: JwtRefreshPayload): Promise<DeviceContextDto> {
    const session = await this.sessionsRepository.findByDeviceIdOrNotFoundFail(
      payload.deviceId,
    );

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const iatDate = new Date(payload.iat * 1000);

    if (iatDate.getTime() !== session.lastActiveDate.getTime()) {
      throw new UnauthorizedException('Refresh token is outdated');
    }

    return payload;
  }
}
