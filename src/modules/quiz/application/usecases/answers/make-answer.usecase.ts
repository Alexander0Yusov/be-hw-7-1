import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { Answer } from 'src/modules/quiz/domain/answer/answer.entity';
import { AnswerInputDto } from 'src/modules/quiz/dto/answer/answer-input.dto';
import {
  AnswerStatuses,
  GameStatuses,
} from 'src/modules/quiz/dto/game-pair-quiz/answer-status';
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
  implements ICommandHandler<MakeAnswerCommand, string | null>
{
  constructor(
    private gamesRepository: GamesRepository,

    private answersRepository: AnswersRepository,
  ) {}

  async execute({ dto, userId }: MakeAnswerCommand): Promise<string | null> {
    // находим активную игру
    const game = await this.gamesRepository.findActiveGame(Number(userId));

    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
        extensions: [{ field: 'game', message: 'User is not in the game' }],
      });
    }

    // устанавливаем членство в данной игре
    // const isFirstPlayer = game.firstPlayerProgress.userId === Number(userId);
    // const isSecondPlayer = game.secondPlayerProgress.userId === Number(userId);

    // if (!isFirstPlayer && !isSecondPlayer) {
    //   throw new DomainException({
    //     code: DomainExceptionCode.Forbidden,
    //     message: 'Forbidden',
    //     extensions: [{ field: 'game', message: 'User is not in the game' }],
    //   });
    // }

    // заранее имеет оба прогресса
    const playerProgress =
      game.firstPlayerProgress.userId === Number(userId)
        ? game.firstPlayerProgress
        : game.secondPlayerProgress;

    const otherPlayerProgress =
      game.firstPlayerProgress.userId !== Number(userId)
        ? game.firstPlayerProgress
        : game.secondPlayerProgress;

    // исключение если все вопросы отвечены
    if (game.questions.length === playerProgress.answers.length) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
        extensions: [
          {
            field: 'answer',
            message: 'User answered all questions',
          },
        ],
      });
    }

    // имеем массивы вопросов и ответов
    const answersArr = playerProgress.answers;
    const questionsArr = game.questions.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

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
    playerProgress.answers.push(answer);

    // если этот ответ стал последним для обоих
    // то меняем статус игры и считаем очки
    // если оба игрока ответили на все вопросы
    if (
      otherPlayerProgress.answers.length === game.questions.length &&
      playerProgress.answers.length === game.questions.length
    ) {
      game.status = GameStatuses.Finished;
      await this.gamesRepository.save(game);
    }

    return answer.id.toString();
  }
}
