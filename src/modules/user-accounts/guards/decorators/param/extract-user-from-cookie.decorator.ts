import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DeviceContextDto } from '../../dto/device-context.dto';

export const Device = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DeviceContextDto => {
    const req = ctx.switchToHttp().getRequest();
    if (!req.user) throw new Error('Device context not found');
    return req.user;
  },
);
