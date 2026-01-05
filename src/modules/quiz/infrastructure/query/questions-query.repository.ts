import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/question/question.entity';
import { QuestionViewDto } from '../../dto/question/question-view.dto';
import { GetQuestionsQueryParams } from '../../dto/question/get-questions-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';

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

  async getAll(
    query: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const qb = this.questionRepo.createQueryBuilder('q');

    // --- Поиск ---
    if (query.bodySearchTerm) {
      qb.andWhere('q.body ILIKE :body', {
        body: `%${query.bodySearchTerm}%`,
      });
    }

    // --- Фильтр по публичности ---
    if (query.publishedStatus === 'published') {
      qb.andWhere('q.publish = true');
    } else if (query.publishedStatus === 'notPublished') {
      qb.andWhere('q.publish = false');
    }

    // --- Маппинг сортировки ---
    const sortFieldMap: Record<string, string> = {
      body: 'q.body',
      createdAt: 'q.createdAt',
    };

    const sortBy = sortFieldMap[query.sortBy] ?? 'q.createdAt';

    // --- COLLATE "C" для строк ---
    const stringFields = ['q.body'];
    const sortField = stringFields.includes(sortBy)
      ? `${sortBy} COLLATE "C"`
      : sortBy;

    // --- Пагинация ---
    qb.orderBy(sortField, query.sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(query.calculateSkip())
      .take(query.pageSize);

    // --- Выполняем запрос + считаем totalCount ---
    const [questions, totalCount] = await qb.getManyAndCount();

    const items = questions.map(QuestionViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
