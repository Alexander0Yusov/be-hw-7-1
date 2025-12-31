import { Like } from '../../domain/like/like.entity';
import { LikeForArrayViewDto } from '../../dto/like/like-for-array-view.dto';

export const likeDocsToViewMap = (
  likeDocsArray: any,
  // LikeDocument[],
): LikeForArrayViewDto[] => {
  const resultArray: LikeForArrayViewDto[] = [];

  for (const like of likeDocsArray) {
    // resultArray.push(Like.mapToView(like));
  }

  return resultArray;
};
