import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/query/blogs-query.repository';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basi-auth.guard';
import { BlogInputDto } from '../dto/blog/blog-input.dto';
import { BlogViewDto } from '../dto/blog/blog-view.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/blogs/create-blog.usecase';
import { GetBlogsQueryParams } from '../dto/blog/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { BlogUpdateDto } from '../dto/blog/blog-update.dto';
import { UpdateBlogCommand } from '../application/usecases/blogs/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/blogs/delete-blog.usecase';
import { CreatePostCommand } from '../application/usecases/posts/create-post.usecase';
import { PostUpdateOnBlogRouteDto } from '../dto/post/post-update-on-blog-route.dto';
import { PostsQueryRepository } from '../infrastructure/query/posts-query.repository';
import { GetPostsQueryParams } from '../dto/post/get-posts-query-params.input-dto';
import { GetPostsByBlogIdQuery } from '../application/usecases/posts/get-posts-by-blog-id.query-handler';
import { UpdatePostCommand } from '../application/usecases/posts/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/posts/delete-post.usecase';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('sa/blogs')
@SkipThrottle()
@UseGuards(BasicAuthGuard)
export class SaBlogsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  async createBySa(@Body() dto: BlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(dto));
    return this.blogsQueryRepository.findByIdOrNotFoundFail(blogId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllBySa(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return await this.blogsQueryRepository.getAll(query);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogBySa(
    @Param('id') id: string,
    @Body() body: BlogUpdateDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(body, id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBySa(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  //
  @Post(':id/posts')
  async createPostBySa(
    @Param('id') id: string,
    @Body() dto: PostUpdateOnBlogRouteDto,
  ): Promise<BlogViewDto | any> {
    const createdPostId = await this.commandBus.execute(
      new CreatePostCommand(
        {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
        },
        id,
      ),
    );

    return await this.postsQueryRepository.findByIdOrNotFoundFail(
      createdPostId,
    );
  }

  @Get(':id/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsByBlogIdBySa(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return await this.queryBus.execute(new GetPostsByBlogIdQuery(query, id));
  }

  @Put(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlogIdBySa(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body() body: PostUpdateOnBlogRouteDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdatePostCommand({ ...body, blogId: id }, postId),
    );
  }

  @Delete(':id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlogIdBySa(
    @Param('id') id: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(id, postId));
  }
}
