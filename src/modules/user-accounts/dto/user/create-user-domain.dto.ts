import { IsEmail, IsString, Matches } from 'class-validator';
import { emailConstraints } from '../../domain/user/user.entity';
import { Trim } from 'src/core/decorators/transform/trim';

export class CreateUserDomainDto {
  login: string;
  passwordHash: string;
  email: string;
}

export class UpdateUserDto {
  @IsString()
  @IsEmail()
  // @Matches(emailConstraints.match)
  @Trim()
  email: string;
}
