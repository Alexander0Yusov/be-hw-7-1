import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentViewDto } from 'src/modules/bloggers-platform/dto/comment/comment-view.dto';
import { CommentsRepository } from 'src/modules/bloggers-platform/infrastructure/comments.repository';
import { LikesRepository } from 'src/modules/bloggers-platform/infrastructure/likes.repository';
import { CommentsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/comments-query.repository';

export class GetCommentCommand {
  constructor(
    public commentId: string,
    public userId?: string,
  ) {}
}

@CommandHandler(GetCommentCommand)
export class GetCommentUseCase
  implements ICommandHandler<GetCommentCommand, CommentViewDto>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private likesRepository: LikesRepository,
  ) {}

  async execute({
    commentId,
    userId,
  }: GetCommentCommand): Promise<CommentViewDto> {
    // делаем квери запрос на комментарий и лайк. затем лепим вью обьект

    //заменяю на запрос из квери репо 20/12/25
    // const comment =
    //   await this.commentsRepository.findByIdOrNotFoundFail(commentId);

    const comment =
      await this.commentsQueryRepository.findByIdOrNotFoundFail(commentId);

    if (userId) {
      const like = await this.likesRepository.findByCommentIdByAuthorId(
        commentId,
        userId,
      );

      if (like) {
        comment.likesInfo.myStatus = like.status;
        return comment;
      }
    }

    return comment;
  }
}
