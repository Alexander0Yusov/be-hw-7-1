import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';
import { PostConnectionViewDto } from '../dto/game-pair-quiz/post-connection-view.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ConnectOrCreatePairCommand } from '../application/usecases/games/connect-or-create-pair.usecase';
import { GamesQueryRepository } from '../infrastructure/query/games-query.repository';

@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    //  private usersService: UsersService,
    //  private usersRepository: UsersRepository,
    private gamesQueryRepository: GamesQueryRepository,
  ) {}

  @Post('connection')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async connectOrCreatePair(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PostConnectionViewDto | null> {
    const gameId = await this.commandBus.execute(
      new ConnectOrCreatePairCommand(user.id),
    );

    //  return await this.queryBus.execute(new GetQuestionQuery(questionId));

    const game = await this.gamesQueryRepository.findByIdOrNotFoundFail(gameId);

    console.log(22222, game);

    return game;
  }
}
