import { IsString } from 'class-validator';

export class DeviceContextDto {
  @IsString()
  id: string;

  @IsString()
  deviceId: string;
}
