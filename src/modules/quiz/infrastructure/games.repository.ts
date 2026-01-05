import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/question/question.entity';
import { Game } from '../domain/game/game.entity';
import { GameStatuses } from '../dto/game-pair-quiz/answer-status';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {}

  async save(game: Game) {
    return await this.gameRepo.save(game);
  }

  async findByStatusOrNotFoundFail(status: GameStatuses): Promise<Game | null> {
    return await this.gameRepo.findOne({
      where: { status: status },
    });
  }
}
