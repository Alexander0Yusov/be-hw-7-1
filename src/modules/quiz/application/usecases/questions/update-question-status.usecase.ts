import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionUpdateStatusDto } from 'src/modules/quiz/dto/question/question-update-status.dto';
import { QuestionsRepository } from 'src/modules/quiz/infrastructure/questions.repository';

export class UpdateQuestionStatusCommand {
  constructor(
    public dto: QuestionUpdateStatusDto,
    public questionId: string,
  ) {}
}

@CommandHandler(UpdateQuestionStatusCommand)
export class UpdateQuestionStatusUseCase
  implements ICommandHandler<UpdateQuestionStatusCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    dto,
    questionId,
  }: UpdateQuestionStatusCommand): Promise<void> {
    const question =
      await this.questionsRepository.findOrNotFoundFail(questionId);

    question.updateStatus(dto);

    await this.questionsRepository.save(question);
  }
}
