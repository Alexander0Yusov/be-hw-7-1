import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { CommentUpdateDto } from 'src/modules/bloggers-platform/dto/comment/comment-update.dto';
import { CommentsRepository } from 'src/modules/bloggers-platform/infrastructure/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public dto: CommentUpdateDto,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({
    dto,
    commentId,
    userId,
  }: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findById(commentId);

    if (comment.userId === Number(userId)) {
      comment.update(dto);
      await this.commentsRepository.save(comment);
    } else {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Comment was created by another user',
      });
    }
  }
}
