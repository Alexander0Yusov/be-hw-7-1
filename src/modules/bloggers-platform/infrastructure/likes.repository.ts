import { Injectable } from '@nestjs/common';
import { Like, ParentEntityType } from '../domain/like/like.entity';
import { LikeStatus } from '../domain/like/like.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,

    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
  ) {}

  async createOrUpdate(
    parentId: string,
    authorId: string,
    parentEntity: ParentEntityType, // 'comment' | 'post'
    newStatus: LikeStatus,
  ): Promise<LikeStatus> {
    const conflictPaths =
      parentEntity === ParentEntityType.Post
        ? ['userId', 'postId']
        : ['userId', 'commentId'];

    const result = await this.likeRepo.upsert(
      {
        userId: Number(authorId),
        status: newStatus,
        parentEntity,
        postId:
          parentEntity === ParentEntityType.Post ? Number(parentId) : null,
        commentId:
          parentEntity === ParentEntityType.Comment ? Number(parentId) : null,
      },
      { conflictPaths, skipUpdateIfNoValuesChanged: false },
    );

    // upsert возвращает объект с raw результатом
    const updated = result.raw[0];
    return updated?.status ?? newStatus;
  }

  async findByPostIdByAuthorId(
    parentId: string,
    authorId: string,
  ): Promise<{ status: LikeStatus }> {
    const like = await this.likeRepo.findOne({
      select: ['status'],
      where: {
        parentEntity: ParentEntityType.Post,
        userId: Number(authorId),
        postId: Number(parentId),
      },
    });

    return { status: like?.status ?? LikeStatus.None };
  }

  async findByCommentIdByAuthorId(
    parentId: string,
    authorId: string,
  ): Promise<{ status: LikeStatus }> {
    const like = await this.likeRepo.findOne({
      select: ['status'],
      where: {
        parentEntity: ParentEntityType.Comment,
        userId: Number(authorId),
        commentId: Number(parentId),
      },
    });

    return { status: like?.status ?? LikeStatus.None };
  }

  // async getLatestLikes(parentId: string): Promise<any> {
  //   // LikeDocument[]
  //   const latestLikes = await this.LikeModel.find({
  //     parentId: '', // new Types.ObjectId(parentId),
  //     status: 'Like',
  //   })
  //     .sort({ createdAt: -1 }) // сортировка по времени — от новых к старым
  //     .limit(3);

  //   return latestLikes;
  // }
}

// CREATE TYPE parent_kind AS ENUM ('post', 'comment');

// CREATE TABLE likes (
//     user_id     INT NOT NULL,
//     parent_id   INT NOT NULL,
//     parent_type parent_kind NOT NULL,
//     status      BOOLEAN NOT NULL,
//     created_at  TIMESTAMP DEFAULT now(),
//     updated_at  TIMESTAMP DEFAULT now(),
//     PRIMARY KEY (user_id, parent_id, parent_type)
// );
