import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmailConfirmation extends BaseDomainEntity {
  @Column()
  public confirmationCode: string;

  @Column({ type: Date })
  public expirationDate: Date;

  @Column({ type: Boolean, default: false })
  public isConfirmed: boolean;

  @OneToOne((type) => User, (user) => user.emailConfirmation)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column()
  public userId: number;
}
