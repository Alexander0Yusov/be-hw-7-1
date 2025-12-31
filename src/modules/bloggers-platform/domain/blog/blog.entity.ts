import { CreateBlogDomainDto } from '../../dto/blog/create-blog-domain.dto';
import { BlogUpdateDto } from '../../dto/blog/blog-update.dto';
import { BaseDomainEntity } from 'src/core/base-domain-entity/base-domain-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Post } from '../post/post.entity';
import { BlogInputDto } from '../../dto/blog/blog-input.dto';

@Entity()
export class Blog extends BaseDomainEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;

  @OneToMany(() => Post, (p) => p.blog, {
    cascade: true,
  })
  posts: Post[];

  static createInstance(dto: BlogInputDto): Blog {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return blog;
  }

  update(dto: BlogInputDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}
