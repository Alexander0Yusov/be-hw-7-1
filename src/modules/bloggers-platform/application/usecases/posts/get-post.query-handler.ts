import {
  CommandHandler,
  ICommandHandler,
  IQueryHandler,
  QueryHandler,
} from '@nestjs/cqrs';
import { LikeStatus } from 'src/modules/bloggers-platform/domain/like/like.entity';
import { PostViewDto } from 'src/modules/bloggers-platform/dto/post/post-view.dto';
import { LikesRepository } from 'src/modules/bloggers-platform/infrastructure/likes.repository';
import { PostsQueryRepository } from 'src/modules/bloggers-platform/infrastructure/query/posts-query.repository';

export class GetPostQuery {
  constructor(
    public postId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostQuery)
export class GetPostHandler
  implements IQueryHandler<GetPostQuery, PostViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private likesRepository: LikesRepository,
  ) {}

  async execute({ postId, userId }: GetPostQuery): Promise<PostViewDto> {
    // делаем квери запрос на комментарий и лайк. затем лепим вью обьект
    const post = await this.postsQueryRepository.findByIdOrNotFoundFail(postId);

    if (userId) {
      const like = await this.likesRepository.findByPostIdByAuthorId(
        postId,
        userId,
      );

      // если юзер авторизован и ставил лайк, то подмешиваем в объект статус
      if (like) {
        post.extendedLikesInfo.myStatus = like.status;
      }
    }

    return post;
  }
}
