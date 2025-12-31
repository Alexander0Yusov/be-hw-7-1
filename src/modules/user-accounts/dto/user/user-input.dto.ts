import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user/user.entity';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

export class UserInputDto {
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  password: string;

  @IsString()
  @IsEmail()
  // @Matches(emailConstraints.match)
  @Trim()
  email: string;
}
