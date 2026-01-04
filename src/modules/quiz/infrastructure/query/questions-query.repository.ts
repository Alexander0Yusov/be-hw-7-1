import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/question/question.entity';
import { QuestionViewDto } from '../../dto/question/question-view.dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) {}

  async findByIdOrNotFoundFail(id: string): Promise<QuestionViewDto> {
    const question = await this.questionRepo.findOne({
      where: { id: Number(id) },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return QuestionViewDto.mapToView(question);
  }
}
