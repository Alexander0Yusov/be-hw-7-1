import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogViewDto } from '../../dto/blog/blog-view.dto';
import { GetBlogsQueryParams } from '../../dto/blog/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/blog/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,

    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
  ) {}

  async findByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.blogRepo.findOne({ where: { id: Number(id) } });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const qb = this.blogRepo.createQueryBuilder('b');

    // --- Поиск ---
    if (query.searchNameTerm) {
      qb.andWhere('b.name ILIKE :name', {
        name: `%${query.searchNameTerm}%`,
      });
    }

    // --- Маппинг сортировки ---
    const sortFieldMap: Record<string, string> = {
      name: 'b.name',
      createdAt: 'b.createdAt',
    };

    const sortBy = sortFieldMap[query.sortBy] ?? 'b.createdAt';

    // --- COLLATE "C" для строк ---
    const stringFields = ['b.name'];
    const sortField = stringFields.includes(sortBy)
      ? `${sortBy} COLLATE "C"`
      : sortBy;

    // --- Пагинация ---
    qb.orderBy(sortField, query.sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(query.calculateSkip())
      .take(query.pageSize);

    // --- Выполняем запрос + считаем totalCount ---
    const [blogs, totalCount] = await qb.getManyAndCount();

    const items = blogs.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
