import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from 'src/modules/bloggers-platform/infrastructure/posts.repository';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/blogs-query.repository';

export class DeletePostCommand {
  constructor(
    public blogId,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ blogId, postId }: DeletePostCommand): Promise<void> {
    await this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);
    await this.postsRepository.deleteOrNotFoundFail(postId);
  }
}
