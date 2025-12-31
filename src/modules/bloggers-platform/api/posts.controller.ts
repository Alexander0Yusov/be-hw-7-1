import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from '../infrastructure/query/posts-query.repository';
import { PostInputDto } from '../dto/post/post-iput.dto';
import { PostViewDto } from '../dto/post/post-view.dto';
import { GetPostsQueryParams } from '../dto/post/get-posts-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../dto/comment/comment-view.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CommentInputDto } from '../dto/comment/comment-input.dto';
import { CreateCommentCommand } from '../application/usecases/comments/create-comment.usecase';
import { ExtractUserFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { CommentsQueryRepository } from '../infrastructure/query/comments-query.repository';
import { LikeInputDto } from '../dto/like/like-input.dto';
import { UpdatePostLikeStatusCommand } from '../application/usecases/posts/update-post-like-status.usecase';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basi-auth.guard';
import { CreatePostCommand } from '../application/usecases/posts/create-post.usecase';
import { ExtractUserIfExistsFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { LikesQueryRepository } from '../infrastructure/query/likes-query.repository';
import { postItemsGetsMyStatus } from '../application/mapers/post-items-gets-my-status';
import { GetCommentsQueryParams } from '../dto/comment/get-comments-query-params.input-dto';
import { commentItemsGetsMyStatus } from '../application/mapers/comment-items-gets-my-status';
import { GetPostQuery } from '../application/usecases/posts/get-post.query-handler';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('posts')
@SkipThrottle()
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private likesQueryRepository: LikesQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() dto: PostInputDto): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(
      new CreatePostCommand(
        {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
        },
        dto.blogId,
      ),
    );
    return await this.postsQueryRepository.findByIdOrNotFoundFail(postId);
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PostViewDto> {
    return await this.queryBus.execute(new GetPostQuery(id, user?.id));
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const posts = await this.postsQueryRepository.getAll(query);

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

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForCurrentPost(
    @Param('id') id: string,
    @Body() body: CommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand(body, id, user.id),
    );

    const ff =
      await this.commentsQueryRepository.findByIdOrNotFoundFail(commentId);

    return ff;
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatusForCurrentPost(
    @Param('id') id: string,
    @Body() body: LikeInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(body, id, user.id),
    );
  }

  @Get(':id/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentsByPostId(
    @Param('id') id: string,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsQueryRepository.findByIdOrNotFoundFail(id);

    const comments = await this.commentsQueryRepository.findManyByPostId(
      id,
      query,
    );

    if (user?.id) {
      const commentIds = comments.items.map((comment) => Number(comment.id));
      const likes = await this.likesQueryRepository.getMyLikesForCommentsIds(
        commentIds,
        user.id,
      );

      const updatedItems = commentItemsGetsMyStatus(comments.items, likes);
      comments.items = updatedItems;
    }

    return comments;
  }
}
