import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostUpdateDto } from 'src/modules/bloggers-platform/dto/post/post-update.dto';
import { PostsRepository } from 'src/modules/bloggers-platform/infrastructure/posts.repository';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/blogs-query.repository';

export class UpdatePostCommand {
  constructor(
    public dto: PostUpdateDto,
    public postId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand, void>
{
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ dto, postId }: UpdatePostCommand): Promise<void> {
    await this.blogsQueryRepository.findByIdOrNotFoundFail(dto.blogId);

    const post = await this.postsRepository.findOrNotFoundFail(postId);

    // if (post.blogId !== Number(dto.blogId)) {
    //   throw new NotFoundException();
    // }

    post.update(dto);

    await this.postsRepository.save(post);
  }
}
