import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { passwordConstraints } from '../../domain/user/user.entity';

export class PasswordRecoveryDto {
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  newPassword: string;

  @IsString()
  @Trim()
  recoveryCode: string;
}
