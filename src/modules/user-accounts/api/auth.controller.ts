import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request as Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserInputDto } from '../dto/user/user-input.dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from '../dto/user/user-view.dto';
import { UpdateUserDto } from '../dto/user/create-user-domain.dto';
import { PasswordRecoveryDto } from '../dto/user/password-recovery.dto';
import { ConfirmationCodeDto } from '../dto/user/confirmation-code.dto';
import type { Request, Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTokensPairCommand } from '../application/usecases/auth/create-tokens-pair.usecase';
import { CreateSessionCommand } from '../application/usecases/sessions/create-session.usecase';
import { RefreshJwtAuthGuard } from '../guards/bearer-refresh/refresh-jwt-auth.guard';
import { DeviceContextDto } from '../guards/dto/device-context.dto';
import { Device } from '../guards/decorators/param/extract-user-from-cookie.decorator';
import { RevokingSessionCommand } from '../application/usecases/sessions/revoking-session.usecase';
import { Throttle } from '@nestjs/throttler';
import { UpdateSessionCommand } from '../application/usecases/sessions/update-session.usecase';
import { AuthRegisterCommand } from '../application/usecases/auth/auth-register.usecase';
import { AuthEmailConfirmationCommand } from '../application/usecases/auth/auth-email-confirmation.usecase';
import { AuthEmailResendConfirmationCommand } from '../application/usecases/auth/auth-email-resend-confirmation.usecase';
import { AuthSendRecoveryPasswordCodeCommand } from '../application/usecases/auth/auth-send-recovery-password-code.usecase';
import { AuthNewPasswordApplyingCommand } from '../application/usecases/auth/auth-new-password-applying.usecase';
import { GetMeQuery } from '../application/usecases/auth/get-me.query-handler';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post('registration')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: UserInputDto): Promise<void> {
    await this.commandBus.execute(new AuthRegisterCommand(body));
  }

  @Post('login')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const ip = req.ip as string; // || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const deviceName = req.get('user-agent') || 'Unknown device';

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new CreateTokensPairCommand({ userId: user.id }),
    );

    await this.commandBus.execute(
      new CreateSessionCommand({ refreshToken, ip, deviceName }),
    );

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // true в проде, false в dev при http (+/-)
    });

    return { accessToken };
  }

  @Post('refresh-token')
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Device() deviceContext: DeviceContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new CreateTokensPairCommand({
        userId: deviceContext.id,
        deviceId: deviceContext.deviceId,
      }),
    );

    await this.commandBus.execute(new UpdateSessionCommand({ refreshToken }));

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // true в проде, false в dev при http (+/-)
    });

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshJwtAuthGuard)
  async logout(@Device() deviceContext: DeviceContextDto): Promise<void> {
    await this.commandBus.execute(
      new RevokingSessionCommand({ deviceId: deviceContext.deviceId }),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return await this.queryBus.execute(new GetMeQuery({ id: user.id }));
    // return await this.authQueryRepository.me(user.id);
  }

  @Post('password-recovery')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: UpdateUserDto) {
    await this.commandBus.execute(
      new AuthSendRecoveryPasswordCodeCommand(body),
    );
  }

  @Post('new-password')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() body: PasswordRecoveryDto) {
    await this.commandBus.execute(new AuthNewPasswordApplyingCommand(body));
  }

  @Post('registration-confirmation')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() body: ConfirmationCodeDto) {
    await this.commandBus.execute(new AuthEmailConfirmationCommand(body));
  }

  @Post('registration-email-resending')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: UpdateUserDto) {
    await this.commandBus.execute(new AuthEmailResendConfirmationCommand(body));
    //поубирать устаревшие сервисы везде !!
  }
}
