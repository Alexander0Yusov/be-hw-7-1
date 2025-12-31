import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RefreshJwtAuthGuard } from '../guards/bearer-refresh/refresh-jwt-auth.guard';
import { Device } from '../guards/decorators/param/extract-user-from-cookie.decorator';
import { DeviceContextDto } from '../guards/dto/device-context.dto';
import { GetAllSessionsQuery } from '../application/usecases/sessions/get-all-sessions.query-handler';
import { SessionViewDto } from '../dto/session/session-view.dto';
import { TerminateAllExcludeCurrentSessionCommand } from '../application/usecases/sessions/terminate-all-exclude-current-session.usecase';
import { TerminateByIdCommand } from '../application/usecases/sessions/terminate-by-id-session.usecase';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('security')
export class SecurityDevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('devices')
  @UseGuards(RefreshJwtAuthGuard)
  async getDevices(
    @Device() deviceContext: DeviceContextDto,
  ): Promise<SessionViewDto[]> {
    return await this.queryBus.execute(
      new GetAllSessionsQuery({ id: deviceContext.id }),
    );
  }

  @Delete('devices')
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevicesExcludeCurrent(
    @Device() deviceContext: DeviceContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateAllExcludeCurrentSessionCommand({
        id: deviceContext.id,
        deviceId: deviceContext.deviceId,
      }),
    );
  }

  @Delete('devices/:id')
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeviceById(
    @Param('id') id: string,
    @Device() deviceContext: DeviceContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateByIdCommand({
        id: deviceContext.id,
        deviceId: id,
      }),
    );
  }
}
