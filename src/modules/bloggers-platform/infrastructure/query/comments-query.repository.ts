import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../dto/comment/comment-view.dto';
import { GetCommentsQueryParams } from '../../dto/comment/get-comments-query-params.input-dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommentDbDto } from '../../dto/comment/comment-db.dto';
import {
  Like,
  LikeStatus,
  ParentEntityType,
} from '../../domain/like/like.entity';
import { Comment } from '../../domain/comment/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  //   async findByIdOrNotFoundFail(
  //     commentId: string,
  //     authorId?: string,
  //   ): Promise<CommentViewDto> {
  //     const params: any[] = [Number(commentId)];

  //     let sql = `
  //   SELECT c.id, c.content, c.user_id, c.created_at, u.login, l.status
  //   FROM comments c
  //   JOIN users u ON c.user_id = u.id
  //   LEFT JOIN likes l ON l.parent_id = c.id AND l.parent_type = 'comment'
  // `;

  //     if (authorId) {
  //       sql += ` AND l.user_id = $2`;
  //       params.push(Number(authorId));
  //     }

  //     sql += ` WHERE c.id = $1`;

  //     const [comment] = await this.dataSource.query(sql, params);

  //     if (!comment) {
  //       throw new NotFoundException('Comment not found');
  //     }

  //     const { id, content, user_id, login, status, created_at } = comment;

  //     const [counts] = await this.dataSource.query(
  //       `
  //       SELECT
  //       COUNT(*) FILTER (WHERE status = 'Like')::int  AS likes_count,
  //       COUNT(*) FILTER (WHERE status = 'Dislike')::int AS dislikes_count
  //       FROM likes
  //       WHERE parent_id = $1 AND parent_type = $2 AND status != 'None';
  //       `,
  //       [Number(commentId), 'comment'],
  //     );

  //     return {
  //       id: String(id),
  //       content: content,
  //       commentatorInfo: { userId: String(user_id), userLogin: login },
  //       createdAt: created_at,
  //       likesInfo: {
  //         likesCount: counts.likes_count,
  //         dislikesCount: counts.dislikes_count,
  //         myStatus: status ?? 'None',
  //       },
  //     };
  //   }

  async findByIdOrNotFoundFail(
    commentId: string,
    authorId?: string,
  ): Promise<CommentViewDto> {
    // Загружаем комментарий вместе с пользователем
    const comment: any = await this.commentRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .where('c.id = :id', { id: Number(commentId) })
      .getOne();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Подсчёт лайков/дизлайков
    const counts = await this.likeRepo
      .createQueryBuilder('l')
      .select([
        `COUNT(*) FILTER (WHERE l.status = 'Like')::int AS "likesCount"`,
        `COUNT(*) FILTER (WHERE l.status = 'Dislike')::int AS "dislikesCount"`,
      ])
      .where('l.commentId = :id', { id: Number(commentId) })
      .andWhere('l.parentEntity = :parentEntity', {
        parentEntity: ParentEntityType.Comment,
      })
      .andWhere("l.status != 'None'") // возможно надо снести
      .getRawOne();

    // Определяем статус текущего пользователя (если передан authorId)
    let myStatus: LikeStatus = LikeStatus.None;
    if (authorId) {
      const myLike = await this.likeRepo.findOne({
        where: {
          commentId: Number(commentId),
          userId: Number(authorId),
          parentEntity: ParentEntityType.Comment,
        },
      });
      myStatus = myLike?.status ?? LikeStatus.None;
    }

    return {
      id: String(comment.id),
      content: comment.content,
      commentatorInfo: {
        userId: String(comment.userId),
        userLogin: comment.user.login,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: counts.likesCount,
        dislikesCount: counts.dislikesCount,
        myStatus,
      },
    };
  }

  //   async findManyByPostId(
  //     id: string,
  //     queryDto: GetCommentsQueryParams,
  //   ): Promise<PaginatedViewDto<CommentViewDto[]>> {
  //     const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
  //     const skip = (pageNumber - 1) * pageSize;

  //     const commentsQuery = `
  //     SELECT
  //   c.id,
  //   c.content,
  //   c.user_id,
  //   c.created_at,
  //   u.login,
  //   COUNT(*) FILTER (WHERE l.status = 'Like')::int AS "likesCount",
  //   COUNT(*) FILTER (WHERE l.status = 'Dislike')::int AS "dislikesCount"
  // FROM comments c
  // JOIN users u ON c.user_id = u.id
  // LEFT JOIN likes l
  //   ON l.parent_id = c.id
  //  AND l.parent_type = 'comment'
  // WHERE c.post_id = $1
  // GROUP BY c.id, c.content, c.user_id, c.created_at, u.login
  // ORDER BY c.created_at ${sortDirection.toUpperCase()}
  // OFFSET $2
  // LIMIT $3;
  //   `;

  //     const comments: (CommentDbDto & {
  //       login: string;
  //       likesCount: number;
  //       dislikesCount: number;
  //     })[] = await this.dataSource.query(commentsQuery, [
  //       Number(id),
  //       skip,
  //       pageSize,
  //     ]);

  // const items = comments.map((comment) => CommentViewDto.mapToView(comment));

  //     const totalCountResult = await this.dataSource.query(
  //       `
  //     SELECT COUNT(*)::int AS "totalCount"
  //     FROM comments c
  //     WHERE c.post_id = $1;
  //     `,
  //       [Number(id)],
  //     );

  //     return PaginatedViewDto.mapToView({
  //       items,
  //       totalCount: totalCountResult[0].totalCount,
  //       page: queryDto.pageNumber,
  //       size: queryDto.pageSize,
  //     });
  //   }

  // async findManyByPostId(
  //   id: string,
  //   queryDto: GetCommentsQueryParams,
  // ): Promise<PaginatedViewDto<CommentViewDto[]>> {
  //   const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
  //   const skip = (pageNumber - 1) * pageSize;

  //   console.log(90000000000000);

  //   const commentsRaw = await this.commentRepo
  //     .createQueryBuilder('c')
  //     .leftJoin('c.user', 'u')
  //     .leftJoin('c.likes', 'l', 'l.parentEntity = :parentEntity', {
  //       parentEntity: ParentEntityType.Comment,
  //     })
  //     .select([
  //       'c.id AS id',
  //       'c.content AS content',
  //       'c.userId AS "userId"',
  //       'c.createdAt AS "createdAt"',
  //       'u.login AS login',
  //       `COUNT(*) FILTER (WHERE l.status = 'Like')::int AS "likesCount"`,
  //       `COUNT(*) FILTER (WHERE l.status = 'Dislike')::int AS "dislikesCount"`,
  //     ])
  //     .where('c.postId = :postId', { postId: Number(id) })
  //     .groupBy('c.id')
  //     .addGroupBy('c.content')
  //     .addGroupBy('c.userId')
  //     .addGroupBy('c.createdAt')
  //     .addGroupBy('u.login')
  //     .orderBy(`c.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
  //     .skip(skip)
  //     .take(pageSize)
  //     .getRawMany<{
  //       id: number;
  //       content: string;
  //       userId: number;
  //       createdAt: Date;
  //       login: string;
  //       likesCount: number;
  //       dislikesCount: number;
  //     }>();

  //   console.log(88888, commentsRaw);

  //   const items = commentsRaw.map((comment) =>
  //     CommentViewDto.mapToView(comment),
  //   );

  //   console.log(77777, items[0]);

  //   const totalCount = await this.commentRepo
  //     .createQueryBuilder('c')
  //     .where('c.postId = :postId', { postId: Number(id) })
  //     .getCount();

  //   console.log(66666, totalCount);

  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: pageNumber,
  //     size: pageSize,
  //   });
  // }

  async findManyByPostId(
    postId: string,
    queryDto: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const qb = this.commentRepo
      .createQueryBuilder('c')
      .leftJoin('c.user', 'u')
      .leftJoin('c.likes', 'l', 'l.parentEntity = :parentEntity', {
        parentEntity: ParentEntityType.Comment,
      })
      .select([
        'c.id AS id',
        'c.content AS content',
        'c.userId AS "userId"',
        'c.createdAt AS "createdAt"',
        'u.login AS login',
        `SUM(CASE WHEN l.status = 'Like' THEN 1 ELSE 0 END)::int AS "likesCount"`,
        `SUM(CASE WHEN l.status = 'Dislike' THEN 1 ELSE 0 END)::int AS "dislikesCount"`,
      ])
      .where('c.postId = :postId', { postId: Number(postId) })
      .groupBy('c.id')
      .addGroupBy('c.content')
      .addGroupBy('c.userId')
      .addGroupBy('c.createdAt')
      .addGroupBy('u.login');

    // сортировка
    const sortFieldMap: Record<string, string> = {
      content: 'c.content',
      createdAt: 'c.createdAt',
      userLogin: 'u.login',
    };
    const sortBy = sortFieldMap[queryDto.sortBy] ?? 'c.createdAt';
    const direction = queryDto.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    qb.orderBy(sortBy, direction).addOrderBy('c.id', 'ASC');

    // !!! скип/тейк не работает с гроупбай
    // пагинация
    qb.offset(queryDto.calculateSkip());
    qb.limit(queryDto.pageSize);

    // получаем данные и общее количество
    const [commentsRaw, totalCount] = await Promise.all([
      qb.getRawMany<{
        id: number;
        content: string;
        userId: number;
        createdAt: Date;
        login: string;
        likesCount: number;
        dislikesCount: number;
      }>(),
      this.commentRepo
        .createQueryBuilder('c')
        .where('c.postId = :postId', { postId: Number(postId) })
        .getCount(),
    ]);

    const items = commentsRaw.map((comment) =>
      CommentViewDto.mapToView(comment),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryDto.pageNumber,
      size: queryDto.pageSize,
    });
  }
}
