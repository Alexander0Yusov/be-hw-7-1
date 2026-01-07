import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { GameStatuses } from 'src/modules/quiz/dto/game-pair-quiz/answer-status';
import { PostConnectionViewDto } from 'src/modules/quiz/dto/game-pair-quiz/post-connection-view.dto';
import { GamesQueryRepository } from 'src/modules/quiz/infrastructure/query/games-query.repository';

export class GetCurrentGameByIdQuery {
  constructor(
    public gameId: string,
    public userId: string,
  ) {}
}

@QueryHandler(GetCurrentGameByIdQuery)
export class GetCurrentGameByIdHandler
  implements IQueryHandler<GetCurrentGameByIdQuery, PostConnectionViewDto>
{
  constructor(private gamesQueryRepository: GamesQueryRepository) {}

  async execute({
    gameId,
    userId,
  }: GetCurrentGameByIdQuery): Promise<PostConnectionViewDto> {
    const game = await this.gamesQueryRepository.findByIdOrNotFoundFail(gameId);

    const isFirst = game.firstPlayerProgress?.player.id === userId;
    const isSecond = game.secondPlayerProgress?.player.id === userId;

    if (!isFirst && !isSecond) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
        extensions: [{ field: 'game', message: 'User is not in the game' }],
      });
    }

    if (game.status !== GameStatuses.Finished) {
      return game;
    }

    // при условии что статус игры "окончена", находим чей последний ответ был раньше,
    // добавляем 1 балл
    const firstPlayerTime = new Date(
      game.firstPlayerProgress.answers.pop()!.addedAt,
    );
    const secondPlayerTime = new Date(
      game.secondPlayerProgress!.answers.pop()!.addedAt,
    );

    if (
      firstPlayerTime > secondPlayerTime &&
      game.secondPlayerProgress!.score > 0
    ) {
      game.secondPlayerProgress!.score = game.secondPlayerProgress!.score + 1;
    }

    if (
      firstPlayerTime < secondPlayerTime &&
      game.firstPlayerProgress!.score > 0
    ) {
      game.firstPlayerProgress!.score = game.firstPlayerProgress!.score + 1;
    }

    firstPlayerTime > secondPlayerTime
      ? (game.finishGameDate = firstPlayerTime)
      : (game.finishGameDate = secondPlayerTime);

    console.log(2222220000, '-----------------------------', game);

    return game;
  }
}
