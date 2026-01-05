import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionInputDto } from 'src/modules/quiz/dto/question/question-input.dto';
import { QuestionsRepository } from 'src/modules/quiz/infrastructure/questions.repository';

export class UpdateQuestionCommand {
  constructor(
    public dto: QuestionInputDto,
    public questionId: string,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ dto, questionId }: UpdateQuestionCommand): Promise<void> {
    const question =
      await this.questionsRepository.findOrNotFoundFail(questionId);

    question.update(dto);

    await this.questionsRepository.save(question);
  }
}
