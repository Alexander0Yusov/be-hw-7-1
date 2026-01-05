import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';
import { deleteAllData } from './helpers/delete-all-data';
import { createFakeUser } from 'src/testing/utils/users/create-fake-user';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import { initTestApp } from './helpers/init-test-app';

describe('users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // // тестовый модуль
    // const moduleRef = await Test.createTestingModule({
    //   imports: [AppModule],
    // }).compile();

    // // приложение
    // app = moduleRef.createNestApplication();

    // // настройка пайпов, фильтров итд
    // appSetup(app);

    // // запуск прил
    // await app.init();

    // нужно вот так настроенное прил, те с учетом динамического добавления тест модуля
    app = await initTestApp();
  });

  beforeEach(async () => {
    // await deleteAllData(app);
  });

  afterAll(async () => {
    await deleteAllData(app);
    await app.close();
  });

  it('should create question', async () => {
    const newQuestion_1 = {
      body: 'capital of GB',
      correctAnswers: ['London'],
    };

    const createdQuestion = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .send(newQuestion_1)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.CREATED);

    //
    const newQuestion_2 = {
      body: 'capital of USA',
      correctAnswers: ['Washington'],
    };

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .send(newQuestion_2)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.CREATED);

    //
    const newQuestion_3 = {
      body: 'capital of Spain',
      correctAnswers: ['Madrid'],
    };

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .send(newQuestion_3)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.CREATED);

    //
    const newQuestion_4 = {
      body: 'capital of Albania',
      correctAnswers: ['Tirana'],
    };

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .send(newQuestion_4)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.CREATED);

    // updatedQuestion
    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/sa/quiz/questions/${createdQuestion.body.id}`)
      .send(newQuestion_1)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.NO_CONTENT);

    // updatedStatusQuestion
    await request(app.getHttpServer())
      .put(
        `/${GLOBAL_PREFIX}/sa/quiz/questions/${createdQuestion.body.id}/publish`,
      )
      .send({ published: true })
      .auth('admin', 'qwerty')
      .expect(HttpStatus.NO_CONTENT);

    // get all questions
    const ff = await request(app.getHttpServer())
      .get(
        `/${GLOBAL_PREFIX}/sa/quiz/questions?bodySearchTerm=cap&publishedStatus=all`,
      )
      .auth('admin', 'qwerty')
      .expect(HttpStatus.OK);

    console.log(7777, ff.body);

    // deleteQuestion
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/sa/quiz/questions/${createdQuestion.body.id}`)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.NO_CONTENT);
  });

  let accessToken_1;
  let accessToken_2;

  it('should create game', async () => {
    // создание и логин юзера 1
    const newUser_1 = createFakeUser('1');

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .send(newUser_1)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.CREATED);

    const loginResponse = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({ loginOrEmail: newUser_1.email, password: newUser_1.password })
      .expect(HttpStatus.OK);

    // accessToken из тела
    accessToken_1 = loginResponse.body.accessToken;

    // создание игры
    const createGame = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/connection`)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });

  it('should connect to game', async () => {
    // создание и логин юзера 2
    const newUser_2 = createFakeUser('2');

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .send(newUser_2)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.CREATED);

    const loginResponse_2 = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({ loginOrEmail: newUser_2.email, password: newUser_2.password })
      .expect(HttpStatus.OK);

    // accessToken из тела
    accessToken_2 = loginResponse_2.body.accessToken;

    // создание игры
    const connectToGame = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/connection`)
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });

  it('should make answer', async () => {
    // создание ответа
    const answer = {
      answer: 'washington',
    };

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });
});
