import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsQueryParams } from 'src/modules/bloggers-platform/dto/post/get-posts-query-params.input-dto';
import { PostViewDto } from 'src/modules/bloggers-platform/dto/post/post-view.dto';
import { BlogsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/blogs-query.repository';
import { PostsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/posts-query.repository';

export class GetPostsByBlogIdQuery {
  constructor(
    public dto: GetPostsQueryParams,
    public id?: string,
  ) {}
}

@QueryHandler(GetPostsByBlogIdQuery)
export class GetPostsByBlogIdHandler
  implements IQueryHandler<GetPostsByBlogIdQuery, PostViewDto[]>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute({ dto, id }: GetPostsByBlogIdQuery): Promise<PostViewDto[]> {
    let posts;

    if (id) {
      await this.blogsQueryRepository.findByIdOrNotFoundFail(id);
      posts = await this.postsQueryRepository.getAll(dto, id);
    } else {
      posts = await this.postsQueryRepository.getAll(dto);
    }

    return posts;
  }
}
