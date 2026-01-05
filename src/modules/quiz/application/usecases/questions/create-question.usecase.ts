import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from 'src/modules/quiz/domain/question/question.entity';
import { QuestionInputDto } from 'src/modules/quiz/dto/question/question-input.dto';
import { QuestionsRepository } from 'src/modules/quiz/infrastructure/questions.repository';

export class CreateQuestionCommand {
  constructor(public dto: QuestionInputDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand, string>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ dto }: CreateQuestionCommand): Promise<string> {
    const newQuestion = Question.createInstance(dto);
    const question = await this.questionsRepository.save(newQuestion);

    return String(question.id);
  }
}
