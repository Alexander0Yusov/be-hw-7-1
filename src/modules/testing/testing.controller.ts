import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
// import { InjectConnection } from '@nestjs/mongoose';
// import { Connection } from 'mongoose';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    // @InjectConnection()
    // private readonly databaseConnection: any,
    // Connection,
  }

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    // const tables = [
    //   'blog',
    //   'comment',
    //   'like',
    //   'post',
    //   'session',
    //   'user',
    //   'email_confirmation',
    //   'password_recovery',
    // ];

    // const truncatePromises = tables.map((table) =>
    //   this.dataSource.query(`TRUNCATE "${table}" RESTART IDENTITY CASCADE`),
    // );

    // await Promise.all(truncatePromises);

    await this.dataSource.query(`
  TRUNCATE blog, comment, post, "like", session, "user", email_confirmation, password_recovery
  RESTART IDENTITY CASCADE;
`);

    return {
      status: 'succeeded',
    };
  }
}
