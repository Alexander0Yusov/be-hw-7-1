import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { User } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class PasswordRecovery extends BaseDomainEntity {
  @Column()
  public confirmationCode: string;

  @Column({ type: Date })
  public expirationDate: Date;

  @Column({ type: Boolean, default: false })
  public isConfirmed: boolean;

  @ManyToOne((type) => User, (user) => user.passwordRecoveries)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column()
  public userId: number;
}
