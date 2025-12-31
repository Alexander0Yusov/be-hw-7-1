import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog } from 'src/modules/bloggers-platform/domain/blog/blog.entity';
import { BlogInputDto } from 'src/modules/bloggers-platform/dto/blog/blog-input.dto';
import { BlogsRepository } from 'src/modules/bloggers-platform/infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public dto: BlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const newBlog = Blog.createInstance(dto);
    const blog = await this.blogsRepository.save(newBlog);
    return String(blog.id);
  }
}
