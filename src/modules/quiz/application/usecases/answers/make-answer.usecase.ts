import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Answer } from 'src/modules/quiz/domain/answer/answer.entity';
import { AnswerInputDto } from 'src/modules/quiz/dto/answer/answer-input.dto';
import { AnswerStatuses } from 'src/modules/quiz/dto/game-pair-quiz/answer-status';
import { AnswersRepository } from 'src/modules/quiz/infrastructure/answers.repository';
import { GamesRepository } from 'src/modules/quiz/infrastructure/games.repository';

export class MakeAnswerCommand {
  constructor(
    public dto: AnswerInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(MakeAnswerCommand)
export class MakeAnswerUseCase
  implements ICommandHandler<MakeAnswerCommand, string>
{
  constructor(
    private gamesRepository: GamesRepository,

    private answersRepository: AnswersRepository,
  ) {}

  async execute({ dto, userId }: MakeAnswerCommand): Promise<string> {
    // находим активную игру
    const game = await this.gamesRepository.findActiveGame(Number(userId));

    // имеем массивы вопросов и ответов
    if (game) {
      const questionsArr = game.questions;

      const playerProgress =
        game.firstPlayerProgress.userId === Number(userId)
          ? game.firstPlayerProgress
          : game.secondPlayerProgress;

      const answersArr = playerProgress.answers;

      // ищем первый неотвеченный вопрос
      const firstQuestionWithoutAnswer = questionsArr.find(
        (question) =>
          !answersArr.map((item) => item.questionId).includes(question.id),
      );

      console.log(111111, firstQuestionWithoutAnswer);

      // сличаем ответ
      const answerStatus = firstQuestionWithoutAnswer?.correctAnswers
        .map((q) => q.trim().toLowerCase())
        .includes(dto.answer.trim().toLowerCase())
        ? AnswerStatuses.Correct
        : AnswerStatuses.Incorrect;

      console.log(111222, answerStatus);

      // создаем сущность ответа
      // вписываем ответ со статусом, даем балл и сохраняем сущность
      const newAnswer = Answer.createInstance(
        dto.answer,
        answerStatus,
        firstQuestionWithoutAnswer!.id,
        playerProgress.id,
      );

      const answer = await this.answersRepository.save(newAnswer);

      // если этот ответ стал последним для обоих
      // то меняем статус игры и считаем очки
      // ...

      return answer.id.toString();
    }

    return '';
  }
}
