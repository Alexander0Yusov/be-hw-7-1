import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
// import { InjectConnection } from '@nestjs/mongoose';
// import { Connection } from 'mongoose';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    console.log('TestingController зарегистрирован');
    // @InjectConnection()
    // private readonly databaseConnection: any,
    // Connection,
  }

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    console.log('DELETE /api/testing/all-data вызван');

    await this.dataSource.query(`
  TRUNCATE game, player_progress, question, game_question, answer, blog, comment, post, "like", session, "user", email_confirmation, password_recovery
  RESTART IDENTITY CASCADE;
`);

    return {
      status: 'succeeded',
    };
  }
}
