import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Unique,
} from 'typeorm';
import { LikeForArrayViewDto } from '../../dto/like/like-for-array-view.dto';
import { Post } from '../post/post.entity';
import { Comment } from '../comment/comment.entity';
import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { User } from 'src/modules/user-accounts/domain/user/user.entity';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export enum ParentEntityType {
  Post = 'Post',
  Comment = 'Comment',
}

@Entity()
@Unique('uniq_post_like', ['userId', 'postId'])
@Unique('uniq_comment_like', ['userId', 'commentId'])
export class Like extends BaseDomainEntity {
  @Column({
    type: 'enum',
    enum: LikeStatus,
  })
  status: LikeStatus;

  @Column({
    type: 'enum',
    enum: ParentEntityType,
  })
  parentEntity: ParentEntityType;

  //
  @ManyToOne(() => User, (u) => u.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  //
  @ManyToOne(() => Post, (p) => p.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ nullable: true })
  postId: number | null;

  //
  @ManyToOne(() => Comment, (c) => c.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column({ nullable: true })
  commentId: number | null;

  // static mapToView(like: LikeDocument): LikeForArrayViewDto {
  //   return {
  //     addedAt: like.createdAt.toISOString(),
  //     userId: like.authorId.toString(),
  //     login: like.login,
  //   };
  // }
}
