import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParentEntityType } from 'src/modules/bloggers-platform/domain/like/like.entity';
import { LikeInputDto } from 'src/modules/bloggers-platform/dto/like/like-input.dto';
import { LikesRepository } from 'src/modules/bloggers-platform/infrastructure/likes.repository';
import { PostsRepository } from 'src/modules/bloggers-platform/infrastructure/posts.repository';

export class UpdatePostLikeStatusCommand {
  constructor(
    public dto: LikeInputDto,
    public parentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatepostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand, void>
{
  constructor(
    private postsRepository: PostsRepository,
    private likesRepository: LikesRepository,
  ) {}

  async execute({
    dto,
    parentId,
    userId,
  }: UpdatePostLikeStatusCommand): Promise<void> {
    await this.postsRepository.findOrNotFoundFail(parentId);

    // создание/обновление записи в коллекции лайков
    await this.likesRepository.createOrUpdate(
      parentId,
      userId,
      ParentEntityType.Post,
      dto.likeStatus,
    );
  }
}
