import { LikeStatus } from '../../domain/like/like.entity';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  //
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };

  static mapToView(data: any): PostViewDto {
    return {
      id: String(data.id),
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      blogId: String(data.blogId),
      blogName: data.blogName,
      createdAt: data.createdAt
        ? data.createdAt instanceof Date
          ? data.createdAt.toISOString()
          : new Date(data.createdAt).toISOString()
        : new Date().toISOString(),
      extendedLikesInfo: {
        likesCount: data.likesCount,
        dislikesCount: data.dislikesCount,
        myStatus: LikeStatus.None,
        newestLikes: data.newestLikes,
      },
    };
  }
}
