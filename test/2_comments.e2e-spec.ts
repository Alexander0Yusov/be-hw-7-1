import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import mongoose from 'mongoose';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { UserInputDto } from 'src/modules/user-accounts/dto/user/user-input.dto';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { PaginatedViewDto } from '../src/core/dto/base.paginated.view-dto';
import {
  MeViewDto,
  UserViewDto,
} from '../src/modules/user-accounts/dto/user/user-view.dto';
import { delay } from './helpers/delay';
import { createFakeBlog } from 'src/testing/utils/blogs/create-fake-blog';
import { createFakePost } from 'src/testing/utils/posts/create-fake-post';
import { createFakeUser } from 'src/testing/utils/users/create-fake-user';

describe('comments (e2e)', () => {
  let app: INestApplication<App>;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => moduleBuilder);

    app = result.app;
    userTestManger = result.userTestManger;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await app.close();
  });

  it('should create comment', async () => {
    const createdBlog = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .send(createFakeBlog())
      .auth('admin', 'qwerty')
      .expect(201);

    const createdPost = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .send({
        title: 'fake title',
        shortDescription: 'fake description',
        content: 'fake content',
        blogId: createdBlog.body.id,
      })
      .auth('admin', 'qwerty')
      .expect(201);

    // создание и логин юзера
    const newUser = createFakeUser('1');

    const createdUser = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/users`)
      .send(newUser)
      .auth('admin', 'qwerty')
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({ loginOrEmail: newUser.email, password: newUser.password })
      .expect(HttpStatus.OK);

    // создание комментария
    const createdComment = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}` + `/posts/${createdPost.body.id}` + '/comments')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({ content: 'a'.repeat(25) })
      .expect(HttpStatus.CREATED);

    // отправка лайка на коммент
    await request(app.getHttpServer())
      .put(
        `/${GLOBAL_PREFIX}` +
          `/comments/${createdComment.body.id}` +
          '/like-status',
      )
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NO_CONTENT);

    // запрос коммента со своим лайком
    const myComment = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}` + `/comments/${createdComment.body.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(HttpStatus.OK);

    console.log(6666, myComment.body);

    // отправка лайка на пост
    await request(app.getHttpServer())
      .put(
        `/${GLOBAL_PREFIX}` + `/posts/${createdPost.body.id}` + '/like-status',
      )
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NO_CONTENT);

    // запрос поста со своим лайком
    const myPost = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}` + `/posts/${createdPost.body.id}`)
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(HttpStatus.OK);

    console.log(22222, myPost.body);

    expect(HttpStatus.OK);
  });
});
