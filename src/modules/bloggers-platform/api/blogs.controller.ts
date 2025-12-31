import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlogViewDto } from '../dto/blog/blog-view.dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs-query.repository';
import { GetBlogsQueryParams } from '../dto/blog/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../src/core/dto/base.paginated.view-dto';
import { PostViewDto } from '../dto/post/post-view.dto';
import { PostsQueryRepository } from '../infrastructure/query/posts-query.repository';
import { GetPostsQueryParams } from '../dto/post/get-posts-query-params.input-dto';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { ExtractUserIfExistsFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';
import { LikesQueryRepository } from '../infrastructure/query/likes-query.repository';
import { postItemsGetsMyStatus } from '../application/mapers/post-items-gets-my-status';

@Controller('blogs')
@SkipThrottle()
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.findByIdOrNotFoundFail(id);
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const blogs = await this.blogsQueryRepository.getAll(query);
    return blogs;
  }

  @Get(':id/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsForBlog(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const posts = await this.postsQueryRepository.getAll(query, id);

    if (user?.id) {
      const postIds = posts.items.map((post) => Number(post.id));

      const likes = await this.likesQueryRepository.getMyLikesForPostsIds(
        postIds,
        user.id,
      );

      const updatedItems = postItemsGetsMyStatus(posts.items, likes);
      posts.items = updatedItems;
    }

    return posts;
  }
}
