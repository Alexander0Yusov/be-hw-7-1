import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../domain/blog/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,

    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
  ) {}

  async save(blog: Blog) {
    return await this.blogRepo.save(blog);
  }

  async findOrNotFoundFail(id: string): Promise<Blog> {
    const blog = await this.blogRepo.findOne({ where: { id: Number(id) } });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async deleteOrNotFoundFail(id: string): Promise<void> {
    const result = await this.blogRepo.delete(Number(id));

    if (result.affected === 0) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }
}

// CREATE TABLE blogs (
//     id SERIAL PRIMARY KEY,                -- уникальный идентификатор
//     name VARCHAR(255) NOT NULL,           -- название блога
//     description TEXT,                     -- описание
//     website_url VARCHAR(255),             -- ссылка на сайт
//     is_membership BOOLEAN DEFAULT FALSE,  -- флаг членства
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- дата создания
//     updated_at TIMESTAMP DEFAULT NULL     -- дата обновления
// );
