import { LikeStatus } from '../../domain/like/like.entity';

export type ParentKind = 'post' | 'comment';

export type LikeDbDto = {
  userId: number;
  parentId: number;
  parentEntity: ParentKind;
  status: LikeStatus;
  createdAt: Date;
  updatedAt: Date;
};

// не нужен тип
