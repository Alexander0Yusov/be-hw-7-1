import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Repository,
} from 'typeorm';
import { PlayerProgress } from '../player-progress/player-progress.entity';
import { Question } from '../question/question.entity';
import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { GameStatuses } from '../../dto/game-pair-quiz/answer-status';

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

  @Column({
    type: 'enum',
    enum: GameStatuses,
    default: GameStatuses.PendingSecondPlayer,
  })
  status: GameStatuses;

  static createInstance(firstPlayerId: number): Game {
    const game = new this();

    // создаём прогресс первого игрока
    const progress = new PlayerProgress();
    progress.userId = firstPlayerId;
    progress.answers = [];
    progress.game = game;

    game.firstPlayerProgress = progress;

    return game;
  }

  async connectSecondPlayerAndStart(
    secondPlayerId: number,
    questionRepo: Repository<Question>,
  ): Promise<void> {
    const progress = new PlayerProgress();

    progress.userId = secondPlayerId;
    progress.answers = [];
    progress.game = this;

    this.secondPlayerProgress = progress;

    this.status = GameStatuses.Active;

    const randomQuestions = await questionRepo
      .createQueryBuilder('q')
      .orderBy('RANDOM()')
      .limit(2)
      .getMany();

    randomQuestions.forEach((q) => (q.game = this));

    this.questions = randomQuestions;
  }
}
