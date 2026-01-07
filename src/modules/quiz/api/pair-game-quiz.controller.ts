import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { AnswerInputDto } from '../dto/answer/answer-input.dto';
import { AnswerView } from '../dto/answer/answer-view';
import { MakeAnswerCommand } from '../application/usecases/answers/make-answer.usecase';
import { AnswersQueryRepository } from '../infrastructure/query/answers-query.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { GetMyCurrentQuery } from '../application/usecases/games/get-my-current.query-handler';
import { GetCurrentGameByIdQuery } from '../application/usecases/games/get-current-game-by-id.query-handler';

@Controller('pair-game-quiz/pairs')
export class PairGameQuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    //  private usersService: UsersService,
    private answersQueryRepository: AnswersQueryRepository,
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

    // console.log(22222, game);

    return game;
  }

  @Post('my-current/answers')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async postAnswer(
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: AnswerInputDto,
  ): Promise<AnswerView> {
    const answerId = await this.commandBus.execute(
      new MakeAnswerCommand(body, user.id),
    );

    const answer =
      await this.answersQueryRepository.findByIdOrNotFoundFail(answerId);

    return answer;
  }

  @Get('my-current')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrent(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PostConnectionViewDto> {
    // const game =
    //   await this.gamesQueryRepository.findActiveOrPendingGameOrNotFoundFail(
    //     user.id,
    //   );

    return await this.queryBus.execute(new GetMyCurrentQuery(user.id));

    // console.log(22222, game);

    // return game;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentById(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PostConnectionViewDto> {
    const parsed = Number(id);

    if (isNaN(parsed)) {
      throw new BadRequestException('Invalid id format');
    }

    // const game = await this.gamesQueryRepository.findByIdOrNotFoundFail(id);

    // const isFirst = game.firstPlayerProgress?.player.id === user.id;
    // const isSecond = game.secondPlayerProgress?.player.id === user.id;

    // if (!isFirst && !isSecond) {
    //   throw new DomainException({
    //     code: DomainExceptionCode.Forbidden,
    //     message: 'Forbidden',
    //     extensions: [{ field: 'game', message: 'User is not in the game' }],
    //   });
    // }

    // console.log(22222, game);

    // return game;

    return await this.queryBus.execute(
      new GetCurrentGameByIdQuery(id, user.id),
    );
  }
}
