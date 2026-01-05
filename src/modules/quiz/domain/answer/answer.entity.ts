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

  @ManyToOne(() => PlayerProgress, (pp) => pp.answers, { onDelete: 'CASCADE' })
  playerProgress: PlayerProgress;
}
