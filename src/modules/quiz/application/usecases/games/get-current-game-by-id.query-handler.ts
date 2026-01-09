import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { GameStatuses } from 'src/modules/quiz/dto/game-pair-quiz/answer-status';
import { PostConnectionViewDto } from 'src/modules/quiz/dto/game-pair-quiz/post-connection-view.dto';
import { GamesQueryRepository } from 'src/modules/quiz/infrastructure/query/games-query.repository';

export class GetGameByIdQuery {
  constructor(
    public gameId: string,
    public userId: string,
  ) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameByIdHandler
  implements IQueryHandler<GetGameByIdQuery, PostConnectionViewDto>
{
  constructor(private gamesQueryRepository: GamesQueryRepository) {}

  async execute({
    gameId,
    userId,
  }: GetGameByIdQuery): Promise<PostConnectionViewDto> {
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

    return game;
  }
}
