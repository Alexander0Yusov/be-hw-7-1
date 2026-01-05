import { Answer } from '../../domain/answer/answer.entity';
import { AnswerStatuses } from '../game-pair-quiz/answer-status';

export class AnswerView {
  questionId: string;
  answerStatus: AnswerStatuses;
  addedAt: string;

  static mapToView(dto: Answer): AnswerView {
    return {
      questionId: dto.questionId.toString(),
      answerStatus: dto.status,
      addedAt: dto.createdAt.toISOString(),
    };
  }
}
