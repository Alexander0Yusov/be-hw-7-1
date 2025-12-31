import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../domain/like/like.entity';

export class LikeInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus.None;
}
