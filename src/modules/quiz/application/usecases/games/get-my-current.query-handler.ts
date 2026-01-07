import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameStatuses } from 'src/modules/quiz/dto/game-pair-quiz/answer-status';
import { PostConnectionViewDto } from 'src/modules/quiz/dto/game-pair-quiz/post-connection-view.dto';
import { GamesQueryRepository } from 'src/modules/quiz/infrastructure/query/games-query.repository';

export class GetMyCurrentQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetMyCurrentQuery)
export class GetMyCurrentHandler
  implements IQueryHandler<GetMyCurrentQuery, PostConnectionViewDto>
{
  constructor(private gamesQueryRepository: GamesQueryRepository) {}

  async execute({ userId }: GetMyCurrentQuery): Promise<PostConnectionViewDto> {
    const game =
      await this.gamesQueryRepository.findActiveOrPendingGameOrNotFoundFail(
        userId,
      );

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
