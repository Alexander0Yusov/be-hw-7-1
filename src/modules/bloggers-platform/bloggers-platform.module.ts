import { Module } from '@nestjs/common';
import { Blog } from './domain/blog/blog.entity';
import { BlogsController } from './api/blogs.controller';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsService } from './application/blogs.service';
import { BlogsQueryRepository } from './infrastructure/query/blogs-query.repository';
import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts-query.repository';
import { PostsService } from './application/posts.service';
import { Post } from './domain/post/post.entity';
import { Like } from './domain/like/like.entity';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CommentsService } from './application/comments.service';
import { CommentsController } from './api/comments.controller';
import { Comment } from './domain/comment/comment.entity';
import { CommentsQueryRepository } from './infrastructure/query/comments-query.repository';
import { CreateCommentUseCase } from './application/usecases/comments/create-comment.usecase';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { UpdateCommentUseCase } from './application/usecases/comments/update-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './application/usecases/comments/update-comment-like-status.usecase';
import { GetCommentUseCase } from './application/usecases/comments/get-comment.usecase';
import { DeleteCommentUseCase } from './application/usecases/comments/delete-comment.usecase';
import { LikesRepository } from './infrastructure/likes.repository';
import { UpdatepostLikeStatusUseCase } from './application/usecases/posts/update-post-like-status.usecase';

import { CreatePostUseCase } from './application/usecases/posts/create-post.usecase';
import { LikesQueryRepository } from './infrastructure/query/likes-query.repository';
import { SaBlogsController } from './api/sa-blogs.controller';
import { CreateBlogUseCase } from './application/usecases/blogs/create-blog.usecase';
import { UpdateBlogUseCase } from './application/usecases/blogs/update-blog.usecase';
import { DeleteBlogUseCase } from './application/usecases/blogs/delete-blog.usecase';
import { UpdatePostUseCase } from './application/usecases/posts/update-post.usecase';
import { DeletePostUseCase } from './application/usecases/posts/delete-post.usecase';
import { GetPostsByBlogIdHandler } from './application/usecases/posts/get-posts-by-blog-id.query-handler';
import { GetPostHandler } from './application/usecases/posts/get-post.query-handler';
import { TypeOrmModule } from '@nestjs/typeorm';

export const CommandHandlers = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  GetCommentUseCase,
  DeleteCommentUseCase,
  //
  UpdatepostLikeStatusUseCase,
  GetPostsByBlogIdHandler,
  GetPostHandler,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  //
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
];

@Module({
  imports: [
    UserAccountsModule,
    TypeOrmModule.forFeature([Blog, Post, Comment, Like]),
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController,
    SaBlogsController,
  ],
  providers: [
    BlogsRepository,
    BlogsQueryRepository,
    // BlogsService,
    //
    PostsRepository,
    PostsQueryRepository,
    // PostsService,
    //
    CommentsQueryRepository,
    CommentsRepository,
    // CommentsService,
    //
    LikesRepository,
    LikesQueryRepository,

    ...CommandHandlers,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
