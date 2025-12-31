import { Like } from '../../domain/like/like.entity';
import { CommentViewDto } from '../../dto/comment/comment-view.dto';
import { LikeDbDto } from '../../dto/like/like-db.dto';

export const commentItemsGetsMyStatus = (
  comments: CommentViewDto[],
  likes: Like[],
): CommentViewDto[] => {
  const updatedComments = comments.map((comment) => {
    const currentLike = likes.find(
      (like) => like.commentId!.toString() === comment.id,
    );

    if (currentLike) {
      comment.likesInfo.myStatus = currentLike.status;
    }

    return comment;
  });

  return updatedComments;
};
