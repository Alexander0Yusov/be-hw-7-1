import { CreatePostDomainDto } from '../../dto/post/create-post-domain.dto';
import { PostUpdateDto } from '../../dto/post/post-update.dto';
import { LikeForArrayViewDto } from '../../dto/like/like-for-array-view.dto';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { Blog } from '../blog/blog.entity';
import { PostInputDto } from '../../dto/post/post-iput.dto';
import { Comment } from '../comment/comment.entity';
import { Like } from '../like/like.entity';

@Entity()
export class Post extends BaseDomainEntity {
  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @OneToMany((type) => Like, (l) => l.post)
  likes: Like[];

  @OneToMany(() => Comment, (c) => c.post)
  comments: Comment[];

  @ManyToOne(() => Blog, (b) => b.posts)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column()
  blogId: number;

  static createInstance(dto: PostInputDto): Post {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = Number(dto.blogId);

    return post;
  }

  update(dto: PostUpdateDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  // blogName: string;
  // likesCount: number;
  // dislikesCount: number;
  // newestLikes: LikeForArrayViewDto[];
}
