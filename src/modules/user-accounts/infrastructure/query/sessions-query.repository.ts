import { Injectable } from '@nestjs/common';
import { Session } from '../../domain/session/session.entity';
import { SessionViewDto } from '../../dto/session/session-view.dto';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async findManyForCurrentUser(userId: number): Promise<SessionViewDto[]> {
    const sessions = await this.sessionRepo.find({
      where: {
        userId,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { lastActiveDate: 'DESC' },
    });

    return sessions.map(SessionViewDto.fromEntity);
  }
}
