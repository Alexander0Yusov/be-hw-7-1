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
        'firstPlayerProgress.answers.question',
        'secondPlayerProgress',
        'secondPlayerProgress.user',
        'secondPlayerProgress.answers',
        'secondPlayerProgress.answers.question',
        'questions',
      ],
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return PostConnectionViewDto.mapFrom(game);
  }
}
