import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/question/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) {}

  async save(question: Question) {
    return await this.questionRepo.save(question);
  }

  async findOrNotFoundFail(id: string): Promise<Question> {
    const question = await this.questionRepo.findOne({
      where: { id: Number(id) },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  // async deleteOrNotFoundFail(id: string): Promise<void> {
  //   const result = await this.blogRepo.delete(Number(id));

  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Blog with id ${id} not found`);
  //   }
  // }
}
