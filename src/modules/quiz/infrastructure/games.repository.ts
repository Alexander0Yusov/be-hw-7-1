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

  async findActiveGame(userId: number): Promise<Game | null> {
    const activeGame = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'fpp')
      .leftJoinAndSelect('fpp.answers', 'fppAnswers') // ответы первого игрока
      .leftJoinAndSelect('game.secondPlayerProgress', 'spp')
      .leftJoinAndSelect('spp.answers', 'sppAnswers') // ответы второго игрока
      .leftJoinAndSelect('game.questions', 'questions')
      .where('(fpp.userId = :userId OR spp.userId = :userId)', { userId })
      .andWhere('game.status = :status', { status: GameStatuses.Active })
      .getOne();

    return activeGame;
  }

  async findActiveOrPendingGame(userId: number): Promise<Game | null> {
    const game = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoin('game.firstPlayerProgress', 'fpp')
      .leftJoin('game.secondPlayerProgress', 'spp')
      .where('(fpp.userId = :userId OR spp.userId = :userId)', { userId })
      .andWhere('game.status IN (:...statuses)', {
        statuses: [GameStatuses.Active, GameStatuses.PendingSecondPlayer],
      })
      .getOne();
    return game;
  }
}
