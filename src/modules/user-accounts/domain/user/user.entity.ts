import {
  CreateUserDomainDto,
  UpdateUserDto,
} from '../../dto/user/create-user-domain.dto';
import { addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { EmailConfirmation } from './email-confirmation.entity';
import { PasswordRecovery } from './password-recovery.entity';
import { Session } from '../session/session.entity';
import { Comment } from 'src/modules/bloggers-platform/domain/comment/comment.entity';
import { Like } from 'src/modules/bloggers-platform/domain/like/like.entity';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/,
};

@Entity()
export class User extends BaseDomainEntity {
  @Column({ unique: true, type: 'varchar', collation: 'C' })
  public login: string;

  @Column({ unique: true, type: 'varchar', collation: 'C' })
  public email: string;

  @Column()
  public passwordHash: string;

  @OneToOne((type) => EmailConfirmation, (ec) => ec.user, {
    cascade: true,
  })
  public emailConfirmation: EmailConfirmation;

  @OneToMany((type) => PasswordRecovery, (pr) => pr.user, {
    cascade: true,
  })
  public passwordRecoveries: PasswordRecovery[];

  @OneToMany((type) => Session, (s) => s.user)
  public sessions: Session[];

  @OneToMany((type) => Comment, (c) => c.user, { cascade: true })
  public comments: Comment[];

  @OneToMany((type) => Like, (l) => l.user, {
    cascade: true,
  })
  public likes: Like[];

  static createInstance(dto: CreateUserDomainDto): User {
    const user = new this();

    user.login = dto.login;
    user.passwordHash = dto.passwordHash;
    user.email = dto.email;

    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.user = user;
    emailConfirmation.expirationDate = addDays(new Date(), 2);
    emailConfirmation.confirmationCode = uuidv4();
    user.emailConfirmation = emailConfirmation;

    user.passwordRecoveries = [];

    return user;
  }

  update(dto: UpdateUserDto) {
    // if (dto.email !== this.email) {
    //   this.emailConfirmation.isConfirmed = false;
    //   this.email = dto.email;
    // }
  }

  makeDeleted() {
    // if (this.deletedAt !== null) {
    //   throw new Error('Entity already deleted');
    // }
    // this.deletedAt = new Date();
  }

  setEmailConfirmationCode(code: string, expirationDate: Date): void {
    if (!this.emailConfirmation) {
      this.emailConfirmation = new EmailConfirmation();
      this.emailConfirmation.user = this;
    }

    this.emailConfirmation.confirmationCode = code;
    this.emailConfirmation.expirationDate = expirationDate;
    this.emailConfirmation.isConfirmed = false;
  }

  setPasswordConfirmationCode(code: string, expirationDate: Date) {
    const confirmation = new PasswordRecovery();
    confirmation.user = this;
    confirmation.confirmationCode = code;
    confirmation.expirationDate = expirationDate;
    confirmation.isConfirmed = false;

    // если есть массив
    if (!this.passwordRecoveries) {
      this.passwordRecoveries = [];
    }
    this.passwordRecoveries.push(confirmation);
  }

  setEmailIsConfirmed() {
    this.emailConfirmation.isConfirmed = true;
  }

  setNewPasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;

    if (this.passwordRecoveries) {
      this.passwordRecoveries.forEach((recovery) => {
        recovery.isConfirmed = true;
      });
    }
  }
}
