import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogInputDto } from 'src/modules/bloggers-platform/dto/blog/blog-input.dto';
import { BlogsRepository } from 'src/modules/bloggers-platform/infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public dto: BlogInputDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<UpdateBlogCommand, void>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ dto, id }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    blog.update(dto);

    await this.blogsRepository.save(blog);
  }
}
