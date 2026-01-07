import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../../domain/game/game.entity';
import { GameStatuses } from '../../dto/game-pair-quiz/answer-status';
import { PostConnectionViewDto } from '../../dto/game-pair-quiz/post-connection-view.dto';

@Injectable()
export class GamesQueryRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {}

  async findByIdOrNotFoundFail(id: string): Promise<PostConnectionViewDto> {
    const game = await this.gameRepo.findOne({
      where: { id: Number(id) },
      relations: [
        'firstPlayerProgress',
        'firstPlayerProgress.user',
        'firstPlayerProgress.answers',
        'firstPlayerProgress.answers.gameQuestion',
        'firstPlayerProgress.answers.gameQuestion.question',

        'secondPlayerProgress',
        'secondPlayerProgress.user',
        'secondPlayerProgress.answers',
        'secondPlayerProgress.answers.gameQuestion',
        'secondPlayerProgress.answers.gameQuestion.question',

        'gameQuestions',
        'gameQuestions.question',
      ],
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return PostConnectionViewDto.mapFrom(game);
  }

  async findActiveOrPendingGameOrNotFoundFail(
    userId: string,
  ): Promise<PostConnectionViewDto> {
    const activeGame = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'fpp')
      .leftJoinAndSelect('fpp.user', 'fppUser')
      .leftJoinAndSelect('fpp.answers', 'fppAnswers')
      .leftJoinAndSelect('fppAnswers.gameQuestion', 'fppAnswerGameQuestion')
      .leftJoinAndSelect('fppAnswerGameQuestion.question', 'fppAnswerQuestion')
      .leftJoinAndSelect('game.secondPlayerProgress', 'spp')
      .leftJoinAndSelect('spp.user', 'sppUser')
      .leftJoinAndSelect('spp.answers', 'sppAnswers')
      .leftJoinAndSelect('sppAnswers.gameQuestion', 'sppAnswerGameQuestion')
      .leftJoinAndSelect('sppAnswerGameQuestion.question', 'sppAnswerQuestion')
      .leftJoinAndSelect('game.gameQuestions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'questions')
      .where('(fpp.userId = :userId OR spp.userId = :userId)', { userId })
      .andWhere('game.status IN (:...statuses)', {
        statuses: [GameStatuses.Active, GameStatuses.PendingSecondPlayer],
      })
      .getOne();

    if (!activeGame) {
      throw new NotFoundException('Game not found');
    }

    return PostConnectionViewDto.mapFrom(activeGame);
  }
}
