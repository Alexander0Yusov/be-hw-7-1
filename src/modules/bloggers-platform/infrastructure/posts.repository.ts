import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '../domain/post/post.entity';
import { CreatePostDomainDto } from '../dto/post/create-post-domain.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostUpdateDto } from '../dto/post/post-update.dto';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,

    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async save(post: Post) {
    return await this.postRepo.save(post);
  }

  async findOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id: Number(id) },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return post;
  }

  async deleteOrNotFoundFail(id: string): Promise<void> {
    const result = await this.postRepo.delete(Number(id));

    if (result.affected === 0) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
  }
}

// CREATE TABLE posts (
//   id SERIAL PRIMARY KEY,
//   title TEXT NOT NULL,
//   short_description TEXT NOT NULL,
//   content TEXT NOT NULL,
//   blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
//   blog_name TEXT NOT NULL,
//   likes_count INTEGER NOT NULL DEFAULT 0,
//   dislikes_count INTEGER NOT NULL DEFAULT 0,
//   newest_likes JSONB NOT NULL DEFAULT '[]',
//   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
//   updated_at TIMESTAMP NOT NULL DEFAULT NOW()
// );
