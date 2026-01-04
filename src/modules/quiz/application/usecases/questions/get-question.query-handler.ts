import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { QuestionViewDto } from 'src/modules/quiz/dto/question/question-view.dto';
import { QuestionsQueryRepository } from 'src/modules/quiz/infrastructure/query/questions-query.repository';

export class GetQuestionQuery {
  constructor(public questionId: string) {}
}

@QueryHandler(GetQuestionQuery)
export class GetQuestionHandler
  implements IQueryHandler<GetQuestionQuery, QuestionViewDto>
{
  constructor(private questionsQueryRepository: QuestionsQueryRepository) {}

  async execute({ questionId }: GetQuestionQuery): Promise<QuestionViewDto> {
    const post =
      await this.questionsQueryRepository.findByIdOrNotFoundFail(questionId);

    return post;
  }
}
