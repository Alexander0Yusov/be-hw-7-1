import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { PlayerProgress } from '../player-progress/player-progress.entity';
import { Question } from '../question/question.entity';
import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';

@Entity()
export class Game extends BaseDomainEntity {
  @OneToOne(() => PlayerProgress, (pp) => pp.game, { cascade: true })
  @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @OneToOne(() => PlayerProgress, (pp) => pp.game, { cascade: true })
  @JoinColumn()
  secondPlayerProgress: PlayerProgress;

  @OneToMany(() => Question, (q) => q.game, { cascade: true })
  questions: Question[];
}
