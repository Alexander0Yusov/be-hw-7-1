import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PlayerProgress } from '../player-progress/player-progress.entity';
import { AnswerStatuses } from '../../dto/game-pair-quiz/answer-status';
import { GameQuestion } from '../game-question/game-question.entity';

@Entity()
export class Answer extends BaseDomainEntity {
  @Column()
  body: string;

  @Column({
    type: 'enum',
    enum: AnswerStatuses,
    default: AnswerStatuses.Incorrect,
  })
  status: AnswerStatuses;

  @ManyToOne(() => GameQuestion, (gq) => gq.answers, { onDelete: 'CASCADE' })
  gameQuestion: GameQuestion;

  @Column()
  gameQuestionId: number;

  @ManyToOne(() => PlayerProgress, (pp) => pp.answers, { onDelete: 'CASCADE' })
  playerProgress: PlayerProgress;

  @Column()
  playerProgressId: number;

  static createInstance(
    body: string,
    status: AnswerStatuses,
    gameQuestionId: number,
    playerProgressId: number,
  ): Answer {
    const answer = new Answer();
    answer.body = body;
    answer.status = status;
    answer.gameQuestionId = gameQuestionId;
    answer.playerProgressId = playerProgressId;

    // если нужно сразу связать сущности (stub-объекты)
    answer.gameQuestion = { id: gameQuestionId } as GameQuestion;
    answer.playerProgress = { id: playerProgressId } as PlayerProgress;

    return answer;
  }
}
