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
import { PlayerProgressRepository } from 'src/modules/quiz/infrastructure/player-progress.repository';

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
    private playerProgressRepository: PlayerProgressRepository,
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

    // заранее имеем оба прогресса
    const currentPlayerProgress =
      game.firstPlayerProgress.userId === Number(userId)
        ? game.firstPlayerProgress
        : game.secondPlayerProgress;

    const otherPlayerProgress =
      game.firstPlayerProgress.userId !== Number(userId)
        ? game.firstPlayerProgress
        : game.secondPlayerProgress;

    // имеем массивы вопросов и ответов
    const answersArr = currentPlayerProgress.answers;
    const gameQuestionsArr = game.gameQuestions.sort(
      (a, b) => a.question.createdAt.getTime() - b.question.createdAt.getTime(),
    );

    console.log(
      'gameQuestionsArr:',
      gameQuestionsArr.map((gq) => gq.id),
    );
    console.log(
      'answersArr:',
      answersArr.map((a) => a.gameQuestionId),
    );

    // ищем первый неотвеченный вопрос
    const firstQuestionWithoutAnswer = gameQuestionsArr.find(
      (gq) => !answersArr.map((item) => item.gameQuestionId).includes(gq.id),
    );

    console.log(
      'firstQuestionWithoutAnswer:',
      firstQuestionWithoutAnswer?.id ?? 'none',
    );

    if (!firstQuestionWithoutAnswer) {
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

    console.log(
      'Проверяем вопрос:',
      firstQuestionWithoutAnswer.id,
      firstQuestionWithoutAnswer.question.body,
    );
    console.log(
      'Правильные ответы:',
      firstQuestionWithoutAnswer.question.correctAnswers,
    );
    console.log('Ответ пользователя:', dto.answer);

    // сличаем ответ
    const answerStatus = firstQuestionWithoutAnswer.question.correctAnswers
      .map((q) => q.trim().toLowerCase())
      .includes(dto.answer.trim().toLowerCase())
      ? AnswerStatuses.Correct
      : AnswerStatuses.Incorrect;

    // создаем сущность ответа
    // вписываем ответ со статусом и сохраняем сущность
    const newAnswer = Answer.createInstance(
      dto.answer,
      answerStatus,
      firstQuestionWithoutAnswer.id,
      currentPlayerProgress.id,
    );

    const answer = await this.answersRepository.save(newAnswer);

    console.log('Сохранён ответ:', {
      id: answer.id,
      gameQuestionId: answer.gameQuestionId,
      status: answer.status,
      body: answer.body,
    });

    currentPlayerProgress.answers.push(answer);

    console.log(
      'Все ответы игрока:',
      currentPlayerProgress.answers.map((a) => ({
        id: a.id,
        qId: a.gameQuestionId,
        status: a.status,
      })),
    );

    // прибавляем 1 очко в прогрессе
    if (answerStatus === AnswerStatuses.Correct) {
      currentPlayerProgress.incrementScore();
      await this.playerProgressRepository.save(currentPlayerProgress);
    }

    console.log('Статус ответа:', answerStatus);
    console.log('Баллов на счету:', currentPlayerProgress.score);

    // если этот ответ стал последним для обоих
    // то меняем статус игры
    if (
      otherPlayerProgress.answers.length === game.gameQuestions.length &&
      currentPlayerProgress.answers.length === game.gameQuestions.length
    ) {
      // значит другой игрок справился раньше и ему присуждается бонус+1
      otherPlayerProgress.incrementScore();
      await this.playerProgressRepository.save(otherPlayerProgress);

      game.finish();
      await this.gamesRepository.save(game);
    }

    return answer.id.toString();
  }
}
