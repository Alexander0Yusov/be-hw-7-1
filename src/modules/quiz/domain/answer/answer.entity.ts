import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PlayerProgress } from '../player-progress/player-progress.entity';
import { Question } from '../question/question.entity';
import { AnswerStatuses } from '../../dto/game-pair-quiz/answer-status';

@Entity()
export class Answer extends BaseDomainEntity {
  @Column() body: string; // текст ответа игрока

  @Column({
    type: 'enum',
    enum: AnswerStatuses,
    default: AnswerStatuses.Incorrect,
  })
  status: AnswerStatuses; // статус ответа (Correct / Incorrect)

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question: Question;

  @Column()
  questionId: number;

  @ManyToOne(() => PlayerProgress, (pp) => pp.answers, { onDelete: 'CASCADE' })
  playerProgress: PlayerProgress;

  @Column()
  playerProgressId: number;

  static createInstance(
    body: string,
    status: AnswerStatuses,
    questionId: number,
    playerProgressId: number,
  ): Answer {
    const answer = new Answer();
    answer.body = body;
    answer.status = status;
    answer.questionId = questionId;
    answer.playerProgressId = playerProgressId;

    // если нужно сразу связать сущности (stub-объекты)
    answer.question = { id: questionId } as Question;
    answer.playerProgress = { id: playerProgressId } as PlayerProgress;

    return answer;
  }
}
