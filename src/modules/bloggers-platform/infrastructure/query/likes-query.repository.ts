import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { LikeDbDto } from '../../dto/like/like-db.dto';
import { Like, ParentEntityType } from '../../domain/like/like.entity';

@Injectable()
export class LikesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getMyLikesForPostsIds(
    postsIds: number[],
    myId: string,
  ): Promise<Like[]> {
    const likeRepo = this.dataSource.getRepository(Like);

    const res = await likeRepo.find({
      where: {
        parentEntity: ParentEntityType.Post,
        userId: Number(myId),
        postId: In(postsIds),
      },
    });

    return res;
  }

  async getMyLikesForCommentsIds(
    commentsIds: number[],
    myId: string,
  ): Promise<Like[]> {
    const likeRepo = this.dataSource.getRepository(Like);

    const res = await likeRepo.find({
      where: {
        parentEntity: ParentEntityType.Comment,
        userId: Number(myId),
        commentId: In(commentsIds),
      },
    });

    return res;
  }
}
