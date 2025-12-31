import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from 'src/modules/bloggers-platform/domain/post/post.entity';
import { PostsRepository } from 'src/modules/bloggers-platform/infrastructure/posts.repository';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/blogs-query.repository';

export class PostCreateForBlogDto {
  title: string;
  shortDescription: string;
  content: string;
}

export class CreatePostCommand {
  constructor(
    public dto: PostCreateForBlogDto,
    public blogId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, string>
{
  constructor(
    private postsRepository: PostsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute({ dto, blogId }: CreatePostCommand): Promise<string> {
    await this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);

    const newPost = Post.createInstance({ ...dto, blogId });

    const post = await this.postsRepository.save(newPost);

    return String(post.id);
  }
}
