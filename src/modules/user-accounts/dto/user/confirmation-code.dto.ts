import { IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class ConfirmationCodeDto {
  @IsString()
  @Trim()
  code: string;
}
