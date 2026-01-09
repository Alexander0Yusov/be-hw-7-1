import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerProgress } from '../domain/player-progress/player-progress.entity';

@Injectable()
export class PlayerProgressRepository {
  constructor(
    @InjectRepository(PlayerProgress)
    private readonly playerProgressRepo: Repository<PlayerProgress>,
  ) {}

  async save(playerProgress: PlayerProgress) {
    return await this.playerProgressRepo.save(playerProgress);
  }
}
