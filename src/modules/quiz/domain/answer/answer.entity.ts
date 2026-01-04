import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PlayerProgress } from '../player-progress/player-progress.entity';
import { Question } from '../question/question.entity';

export enum AnswerStatus {
  correct = 'Correct',
  incorrect = 'Incorrect',
}

@Entity()
export class Answer extends BaseDomainEntity {
  @Column() body: string; // текст ответа игрока

  @Column({ type: 'enum', enum: AnswerStatus, default: AnswerStatus.incorrect })
  status: AnswerStatus; // статус ответа (Correct / Incorrect)

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question: Question;

  @ManyToOne(() => PlayerProgress, (pp) => pp.answers, { onDelete: 'CASCADE' })
  playerProgress: PlayerProgress;
}
