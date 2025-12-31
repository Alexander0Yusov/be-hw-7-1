import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { MoreThan, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../domain/session/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async save(session: Session) {
    await this.sessionRepo.save(session);
  }

  async findOrNotFoundFail(userId: string, deviceId: string): Promise<any> {
    // SessionDocument
    // const session = await this.SessionModel.findOne({
    //   userId: '', // new Types.ObjectId(userId),
    //   deviceId,
    // });

    // if (!session) {
    //   throw new DomainException({
    //     code: DomainExceptionCode.NotFound,
    //     message: 'Session not found',
    //   });
    // }

    return null; // session;
  }

  async findByDeviceIdOrNotFoundFail(deviceId: string): Promise<Session> {
    const session = await this.sessionRepo.findOne({
      where: { deviceId },
    });

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    return session;
  }

  async updateExpAndIatTimesOrNotFoundFail(
    deviceId: string,
    expDate: Date,
    iatDate: Date,
  ): Promise<void> {
    const result = await this.sessionRepo.update(
      { deviceId },
      {
        expiresAt: expDate,
        lastActiveDate: iatDate,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Session not found');
    }
  }

  async revokingSessionByDeviceIdOrNotFoundFail(
    deviceId: string,
  ): Promise<void> {
    const result = await this.sessionRepo.update(
      { deviceId },
      { isRevoked: true },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Session not found');
    }
  }

  async deleteManyExceptCurrent(
    userId: number,
    deviceId: string,
  ): Promise<void> {
    await this.sessionRepo.update(
      {
        userId,
        deviceId: Not(deviceId),
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      {
        isRevoked: true,
      },
    );
  }

  async deleteByDeviceIdAndUserId(
    userId: number,
    deviceId: string,
  ): Promise<void> {
    await this.sessionRepo.update(
      { userId, deviceId, isRevoked: false },
      { isRevoked: true },
    );
  }
}
