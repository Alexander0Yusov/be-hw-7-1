import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Game } from '../game/game.entity';
import { Question } from '../question/question.entity';
import { Answer } from '../answer/answer.entity';

@Entity()
export class GameQuestion extends BaseDomainEntity {
  @ManyToOne(() => Game, (game) => game.gameQuestions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @Column()
  gameId: number;

  @ManyToOne(() => Question, (question) => question.gameQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column()
  questionId: number;

  // связь: один вопрос -> много ответов
  @OneToMany(() => Answer, (answer) => answer.gameQuestion, { cascade: true })
  answers: Answer[];
}
