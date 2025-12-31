import { LikeStatus } from '../../domain/like/like.entity';
import { CommentDbDto } from './comment-db.dto';

export class CommentatorInfo {
  userId: string;
  userLogin: string;
}

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };

  static mapToView(
    comment: CommentDbDto & {
      login: string;
      likesCount: number;
      dislikesCount: number;
    },
    myStatus: LikeStatus = LikeStatus.None,
  ): CommentViewDto {
    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId.toString(),
        userLogin: comment.login,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: myStatus,
      },
    };
  }
}
