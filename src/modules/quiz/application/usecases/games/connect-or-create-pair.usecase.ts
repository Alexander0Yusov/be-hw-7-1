import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from 'src/modules/quiz/domain/game/game.entity';
import { Question } from 'src/modules/quiz/domain/question/question.entity';
import { GameStatuses } from 'src/modules/quiz/dto/game-pair-quiz/answer-status';
import { QuestionInputDto } from 'src/modules/quiz/dto/question/question-create.dto';
import { GamesRepository } from 'src/modules/quiz/infrastructure/games.repository';
import { QuestionsRepository } from 'src/modules/quiz/infrastructure/questions.repository';
import { Repository } from 'typeorm';

export class ConnectOrCreatePairCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectOrCreatePairCommand)
export class ConnectOrCreatePairUseCase
  implements ICommandHandler<ConnectOrCreatePairCommand, string>
{
  constructor(
    private gamesRepository: GamesRepository,

    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
  ) {}

  async execute({ userId }: ConnectOrCreatePairCommand): Promise<string> {
    // проверка на наличие беспарных со статусом ожидания
    const gameWithPendingStatus =
      await this.gamesRepository.findByStatusOrNotFoundFail(
        GameStatuses.PendingSecondPlayer,
      );

    if (!gameWithPendingStatus) {
      // если не нашлась игра с существующим ждуном то даем ответ
      // о том что мы сами стали ждуном
      // создаем сущность игры

      const newGame = Game.createInstance(Number(userId));
      const createdGame = await this.gamesRepository.save(newGame);

      return createdGame.id.toString();
    }

    // если есть беспарный то пара закрывается и начинается игра
    // отправить время начала, выбрать 5 вопросов, поменять статус

    await gameWithPendingStatus.connectSecondPlayerAndStart(
      Number(userId),
      this.questionRepo,
    );

    const gameWithActiveStatus = await this.gamesRepository.save(
      gameWithPendingStatus,
    );

    return gameWithActiveStatus.id.toString();
  }
}
