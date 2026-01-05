import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../../domain/answer/answer.entity';
import { AnswerView } from '../../dto/answer/answer-view';

@Injectable()
export class AnswersQueryRepository {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepo: Repository<Answer>,
  ) {}

  async findByIdOrNotFoundFail(id: string): Promise<AnswerView> {
    const answer = await this.answerRepo.findOne({
      where: { id: Number(id) },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    return AnswerView.mapToView(answer);
  }
}
