import { CommentatorInfo } from './commentator-info';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { User } from 'src/modules/user-accounts/domain/user/user.entity';
import { Post } from '../post/post.entity';
import { Like } from '../like/like.entity';
import { CreateCommentDomainDto } from '../../dto/comment/create-comment-domain';
import { CommentUpdateDto } from '../../dto/comment/comment-update.dto';

@Entity()
export class Comment extends BaseDomainEntity {
  @Column()
  content: string;

  @OneToMany((type) => Like, (l) => l.comment)
  likes: Like[];

  @ManyToOne(() => Post, (p) => p.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  postId: number;

  @ManyToOne(() => User, (u) => u.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  static createInstance(dto: CreateCommentDomainDto): Comment {
    const comment = new this();
    comment.content = dto.content;
    comment.userId = dto.userId;
    comment.postId = dto.postId;
    comment.likes = [];
    return comment;
  }

  update(dto: CommentUpdateDto) {
    this.content = dto.content;
  }
}
