import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommentDbDto } from '../dto/comment/comment-db.dto';
import { CommentViewDto } from '../dto/comment/comment-view.dto';
import { LikeStatus } from '../domain/like/like.entity';
import { CommentUpdateDto } from '../dto/comment/comment-update.dto';
import { Comment } from '../domain/comment/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async save(comment: Comment): Promise<Comment> {
    return await this.commentRepo.save(comment);
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id: Number(id) },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    return comment;
  }

  // пора снести с 20/12/25
  async findByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    const [comment] = await this.dataSource.query(
      `
    SELECT 
  c.id,
  c.content,
  c.user_id,
  c.created_at,
  u.login,
  COUNT(*) FILTER (WHERE l.status = 'Like')::int    AS "likesCount",
  COUNT(*) FILTER (WHERE l.status = 'Dislike')::int AS "dislikesCount"
FROM comments c
JOIN users u ON c.user_id = u.id
LEFT JOIN likes l 
  ON l.parent_id = c.id 
 AND l.parent_type = 'comment'
WHERE c.id = $1
GROUP BY c.id, c.content, c.user_id, c.created_at, u.login;
    `,
      [Number(id)],
    );

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    return {
      id: String(comment.id),
      content: comment.content,
      commentatorInfo: {
        userId: String(comment.user_id),
        userLogin: comment.login,
      },
      createdAt: comment.created_at,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: LikeStatus.None,
      },
    };
  }

  async findByIdAndDelete(comment: Comment): Promise<void> {
    await this.commentRepo.remove(comment);
  }
}

// CREATE TABLE comments (
//   id SERIAL PRIMARY KEY,
//   content TEXT NOT NULL,
//   user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
//   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
//   updated_at TIMESTAMP NOT NULL DEFAULT NOW()
// );
