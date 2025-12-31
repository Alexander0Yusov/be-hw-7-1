import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crupto.service';
import { EmailService } from '../../../modules/mailer/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private emailService: EmailService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(login);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }
}
