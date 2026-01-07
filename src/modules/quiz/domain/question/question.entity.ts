import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { QuestionInputDto } from '../../dto/question/question-input.dto';
import { QuestionUpdateStatusDto } from '../../dto/question/question-update-status.dto';
import { GameQuestion } from '../game-question/game-question.entity';

@Entity()
export class Question extends BaseDomainEntity {
  @Column()
  body: string;

  @Column('text', { array: true })
  correctAnswers: string[];

  @Column({ default: false })
  publish: boolean;

  // связь через промежуточную таблицу
  @OneToMany(() => GameQuestion, (gq) => gq.question)
  gameQuestions: GameQuestion[];

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
