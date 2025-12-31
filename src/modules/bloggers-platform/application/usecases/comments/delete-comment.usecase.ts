import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { CommentsRepository } from 'src/modules/bloggers-platform/infrastructure/comments.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ commentId, userId }: DeleteCommentCommand): Promise<void> {
    //делаем запрос, убеждаемся что удаляет автор
    const comment = await this.commentsRepository.findById(commentId);

    if (comment.userId === Number(userId)) {
      // делаем удаление комментария
      await this.commentsRepository.findByIdAndDelete(comment);
    } else {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Comment was created by another user',
      });
    }
  }
}
