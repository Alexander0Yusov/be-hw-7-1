import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from 'src/modules/quiz/infrastructure/questions.repository';

export class DeleteQuestionCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ questionId }: DeleteQuestionCommand): Promise<void> {
    await this.questionsRepository.deleteOrNotFoundFail(questionId);
  }
}
