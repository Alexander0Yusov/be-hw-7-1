import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CreateSessionDomainDto } from '../../dto/session/create-session-domain.dto';
import { User } from '../user/user.entity';
import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';

@Entity()
export class Session extends BaseDomainEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  deviceId: string;

  @ManyToOne((type) => User, (u) => u.sessions)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column()
  public userId: number;

  @Column()
  ip: string;

  @Column()
  deviceName: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz' })
  lastActiveDate: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  static createInstance(dto: CreateSessionDomainDto): Session {
    const session = new this();

    session.deviceId = dto.deviceId;
    session.userId = dto.userId;
    session.ip = dto.ip;
    session.deviceName = dto.deviceName;
    session.expiresAt = dto.expiresAt;
    session.lastActiveDate = dto.lastActiveDate;
    session.isRevoked = dto.isRevoked;

    return session;
  }

  updateExpAndIatTimes(exp: Date, iat: Date) {
    this.expiresAt = exp;
    this.lastActiveDate = iat;
  }

  revoking() {
    this.isRevoked = true;
  }
}
