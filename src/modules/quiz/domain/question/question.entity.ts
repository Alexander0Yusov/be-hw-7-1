import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from '../answer/answer.entity';
import { Game } from '../game/game.entity';
import { QuestionInputDto } from '../../dto/question/question-input.dto';
import { QuestionUpdateStatusDto } from '../../dto/question/question-update-status.dto';

@Entity()
export class Question extends BaseDomainEntity {
  @Column()
  body: string;

  @Column('text', { array: true })
  correctAnswers: string[];

  @Column({ default: false })
  publish: boolean;

  // связь: один вопрос -> много ответов
  @OneToMany(() => Answer, (answer) => answer.question, { cascade: true })
  answers: Answer[];

  @ManyToOne(() => Game, (game) => game.questions, { onDelete: 'CASCADE' })
  game: Game;

  static createInstance(dto: QuestionInputDto): Question {
    const question = new this();

    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.updatedAt = null;

    return question;
  }

  update(dto: QuestionInputDto) {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
    this.updatedAt = new Date();
  }

  updateStatus(dto: QuestionUpdateStatusDto) {
    this.publish = dto.published;
    this.updatedAt = new Date();
  }
}
