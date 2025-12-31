import { Injectable, NotFoundException } from '@nestjs/common';
import { PostViewDto } from '../../dto/post/post-view.dto';
import {
  Like,
  LikeStatus,
  ParentEntityType,
} from '../../domain/like/like.entity';
import { GetPostsQueryParams } from '../../dto/post/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../domain/post/post.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
  ) {}

  async findByIdOrNotFoundFail(id: string): Promise<PostViewDto> {
    const post = await this.postRepo
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .select('p.id', 'id')
      .addSelect('p.title', 'title')
      .addSelect('p.shortDescription', 'shortDescription')
      .addSelect('p.content', 'content')
      .addSelect('p.blogId', 'blogId')
      .addSelect('p.createdAt', 'createdAt')
      .addSelect('b.name', 'blogName')
      .where('p.id = :id', { id: Number(id) })
      .getRawOne();

    if (!post) {
      throw new NotFoundException('blog not found');
    }

    // Подсчёт лайков/дизлайков
    const counts = await this.likeRepo
      .createQueryBuilder('l')
      .select([
        `COUNT(*) FILTER (WHERE l.status = 'Like')::int AS "likesCount"`,
        `COUNT(*) FILTER (WHERE l.status = 'Dislike')::int AS "dislikesCount"`,
      ])
      .where('l.postId = :id', { id: Number(id) })
      .andWhere('l.parentEntity = :parentEntity', {
        parentEntity: ParentEntityType.Post,
      })
      .getRawOne<{ likesCount: number; dislikesCount: number }>();

    // Последние 3 лайка
    const newestLikes = await this.likeRepo
      .createQueryBuilder('l')
      .innerJoin('l.user', 'u')
      .select([
        'l.createdAt AS "addedAt"',
        '"l"."userId"::text AS "userId"',
        'u.login AS "login"',
      ])
      .where('l.postId = :id', { id: Number(id) })
      .andWhere('l.parentEntity = :parentEntity', {
        parentEntity: ParentEntityType.Post,
      })
      .andWhere("l.status = 'Like'")
      .orderBy('l.createdAt', 'DESC') // сортировка по createdAt
      .limit(3)
      .getRawMany<{ addedAt: string; userId: string; login: string }>();

    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: counts!.likesCount,
        dislikesCount: counts!.dislikesCount,
        newestLikes: newestLikes,
        myStatus: LikeStatus.None,
      },
    };
  }

  // async getAll(
  //   query: GetPostsQueryParams,
  //   blogId?: string,
  // ): Promise<PaginatedViewDto<PostViewDto[]>> {
  //   // 1. Создаем QueryBuilder и джоиним блог для получения имени
  //   const qb = this.dataSource
  //     .getRepository(Post)
  //     .createQueryBuilder('p')
  //     .leftJoinAndSelect('p.blog', 'b');

  //   // 2. Фильтрация только по blogId, если он передан
  //   if (blogId) {
  //     qb.andWhere('p.blogId = :blogId', { blogId: Number(blogId) });
  //   }

  //   // 3. Настройка сортировки
  //   const sortFieldMap: Record<string, string> = {
  //     title: 'p.title',
  //     blogName: 'b.name',
  //     createdAt: 'p.createdAt',
  //   };

  //   const sortBy = sortFieldMap[query.sortBy] ?? 'p.createdAt';
  //   const direction = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

  //   // Используем чистые пути p.title или b.name, чтобы не ломать парсер TypeORM
  //   qb.orderBy(sortBy, direction);
  //   qb.addOrderBy('p.id', 'ASC'); // Для стабильности пагинации

  //   // 4. Пагинация
  //   qb.skip(query.calculateSkip());
  //   qb.take(query.pageSize);

  //   // 5. Получаем данные и общее количество
  //   const [posts, totalCount] = await qb.getManyAndCount();

  //   // 6. Маппинг под твой PostViewDto.mapToView
  //   const items = posts.map((post) => {
  //     return PostViewDto.mapToView({
  //       id: post.id,
  //       title: post.title,
  //       shortDescription: post.shortDescription,
  //       content: post.content,
  //       blogId: post.blogId,
  //       blogName: post.blog?.name || '', // Маппер ждет это поле здесь
  //       createdAt: post.createdAt,
  //       likesCount: 0,
  //       dislikesCount: 0,
  //       newestLikes: [],
  //     });
  //   });

  //   // 7. Формируем итоговый объект пагинации
  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const qb = this.dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blog', 'b');

    // фильтрация по blogId
    if (blogId) {
      qb.andWhere('p.blogId = :blogId', { blogId: Number(blogId) });
    }

    // сортировка
    const sortFieldMap: Record<string, string> = {
      title: 'p.title',
      blogName: 'b.name',
      createdAt: 'p.createdAt',
    };
    const sortBy = sortFieldMap[query.sortBy] ?? 'p.createdAt';
    const direction = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    qb.orderBy(sortBy, direction).addOrderBy('p.id', 'ASC');
    qb.skip(query.calculateSkip());
    qb.take(query.pageSize);

    // получаем посты
    const [posts, totalCount] = await qb.getManyAndCount();
    const postIds = posts.map((p) => p.id);

    // агрегаты лайков/дизлайков
    const counts = await this.dataSource
      .getRepository(Like)
      .createQueryBuilder('l')
      .select('l.postId', 'postId')
      .addSelect(`COUNT(CASE WHEN l.status = 'Like' THEN 1 END)`, 'likesCount')
      .addSelect(
        `COUNT(CASE WHEN l.status = 'Dislike' THEN 1 END)`,
        'dislikesCount',
      )
      .where('l.postId IN (:...ids)', { ids: postIds })
      .groupBy('l.postId')
      .getRawMany();

    // последние три лайка
    const newestLikesRaw = await this.dataSource
      .getRepository(Like)
      .createQueryBuilder('l')
      .leftJoin('l.user', 'u')
      .select([
        'l.postId as "postId"',
        `to_char(l.createdAt AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "addedAt"`,
        'l.userId as "userId"',
        'u.login as "login"',
      ])
      .where('l.postId IN (:...ids)', { ids: postIds })
      .andWhere("l.status = 'Like'")
      .orderBy('l.postId', 'ASC')
      .addOrderBy('l.createdAt', 'DESC')
      .getRawMany();

    // группируем newestLikes по postId
    const newestLikesMap: Record<number, any[]> = {};
    for (const like of newestLikesRaw) {
      if (!newestLikesMap[like.postId]) newestLikesMap[like.postId] = [];
      if (newestLikesMap[like.postId].length < 3) {
        newestLikesMap[like.postId].push({
          addedAt: like.addedAt,
          userId: like.userId.toString(),
          login: like.login,
        });
      }
    }

    // собираем DTO

    const items = posts.map((post) => {
      const stats = counts.find((c) => Number(c.postId) === post.id);
      return PostViewDto.mapToView({
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blog?.name || '',
        createdAt: post.createdAt,
        likesCount: stats ? Number(stats.likesCount) : 0,
        dislikesCount: stats ? Number(stats.dislikesCount) : 0,
        newestLikes: newestLikesMap[post.id] ?? [],
      });
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
