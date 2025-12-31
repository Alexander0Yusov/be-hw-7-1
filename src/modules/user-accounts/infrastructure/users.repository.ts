import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../domain/user/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async save(user: User) {
    await this.userRepo.save(user);
  }

  async findByLoginOrEmailOrNotFoundFail(loginOrEmail: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: [
        { login: loginOrEmail, deletedAt: IsNull() },
        { email: loginOrEmail, deletedAt: IsNull() },
      ],
      relations: ['emailConfirmation'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: [
        { login: loginOrEmail, deletedAt: IsNull() },
        { email: loginOrEmail, deletedAt: IsNull() },
      ],
    });

    return user ?? null;
  }

  async getUserAndEmailConfirmationDataByCodeOrNotFounFail(
    code: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({
      where: {
        deletedAt: IsNull(),
        emailConfirmation: {
          confirmationCode: code,
          isConfirmed: false,
          expirationDate: MoreThan(new Date()),
        },
      },
      relations: ['emailConfirmation'],
    });

    if (!user) {
      throw new NotFoundException('Code not found');
    }

    return user;
  }

  async getUserAndPasswordConfirmationDataOrNotFounFail(
    code: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({
      where: {
        deletedAt: IsNull(),
        passwordRecoveries: {
          confirmationCode: code,
          expirationDate: MoreThan(new Date()),
          isConfirmed: false,
        },
      },
      relations: ['passwordRecoveries'],
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  //   async isEmailAlreadyConfirmed(email: string): Promise<boolean> {
  //     const query = `
  //   SELECT ec.*
  //   FROM email_confirmations ec
  //   JOIN users u ON ec.user_id = u.id
  //   WHERE u.email = $1
  //     AND ec.is_confirmed = TRUE
  // `;

  //     const result = await this.dataSource.query(query, [email]);

  //     if (result.length > 0) {
  //       return true;
  //     }

  //     return false;
  //   }

  async softDeleteById(id: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepo.softRemove(user);
  }
}
