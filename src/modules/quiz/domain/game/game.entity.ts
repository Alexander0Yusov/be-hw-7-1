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
import { GameQuestion } from '../game-question/game-question.entity';

@Entity()
export class Game extends BaseDomainEntity {
  @OneToOne(() => PlayerProgress, (pp) => pp.game, { cascade: true })
  @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @OneToOne(() => PlayerProgress, (pp) => pp.game, { cascade: true })
  @JoinColumn()
  secondPlayerProgress: PlayerProgress;

  @OneToMany(() => GameQuestion, (gq) => gq.game, { cascade: true })
  gameQuestions: GameQuestion[];

  @Column({
    type: 'enum',
    enum: GameStatuses,
    default: GameStatuses.PendingSecondPlayer,
  })
  status: GameStatuses;

  @Column({ type: 'timestamptz', default: null })
  finishGameDate: Date | null;

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
      .limit(5)
      .getMany();

    this.gameQuestions = randomQuestions
      .sort((a, b) => a.id - b.id)
      .map((q) => {
        const gq = new GameQuestion();
        gq.game = this; // привязка к текущей игре
        gq.question = q; // привязка к вопросу из пула
        return gq;
      });
  }

  finish() {
    this.status = GameStatuses.Finished;

    // или время последнего ответа или дедлайн
    this.finishGameDate = new Date();
  }
}
