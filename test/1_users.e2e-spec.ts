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
    // нужно вот так настроенное прил, те с учетом
    // динамического добавления тест модуля
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

    //
    const newQuestion_5 = {
      body: 'capital of Turkey',
      correctAnswers: ['Ankara'],
    };

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .send(newQuestion_5)
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
  });

  let accessToken_1;
  let accessToken_2;
  let createdGame;

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
    createdGame = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/connection`)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);

    // попытка создать вторую игру и получение ошибки 403
    // await request(app.getHttpServer())
    //   .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/connection`)
    //   .auth(accessToken_1, { type: 'bearer' })
    //   .expect(HttpStatus.FORBIDDEN);
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

    // закрытие пары для игры
    const connectToGame = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/connection`)
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });

  it('should make answer part 1', async () => {
    // создание ответа
    const answer_1 = {
      answer: 'london',
    };
    const answer_2 = {
      answer: 'washington',
    };
    const answer_3 = {
      answer: 'madrid',
    };
    const answer_4 = {
      answer: 'tirana',
    };
    const answer_5 = {
      answer: 'ankara',
    };
    const answer_6 = {
      answer: 'sofia',
    };

    // первый игрок 1+, 2+
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_1)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_2)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);

    // второй игрок 1+, 2+
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_1)
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_2)
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.OK);

    // первый игрок 3-
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_6)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);

    // первый игрок 4+
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_4)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);

    // второй игрок 3+
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_3)
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });

  // сверяем часы по первому: 3/4 | по второму: 3/3
  it('should return game by id', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/${createdGame.body.id}`) //
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });

  it('should return my active game', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current`)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });

  it('should return my active game', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current`)
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });

  it('should make answer part 2', async () => {
    // создание ответа
    const answer_1 = {
      answer: 'london',
    };
    const answer_2 = {
      answer: 'washington',
    };
    const answer_3 = {
      answer: 'madrid',
    };
    const answer_4 = {
      answer: 'tirana',
    };
    const answer_5 = {
      answer: 'ankara',
    };
    const answer_6 = {
      answer: 'sofia',
    };

    // первый игрок 5+
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_5)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.OK);

    // второй игрок 4-, 5+
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_1)
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .send(answer_5)
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });

  //  сверяем часы по первому: 5/5 4+1=5 | по второму: 5/5 4+0=4
  it('should return game by id', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/${createdGame.body.id}`) //
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.OK);
  });

  it('should return my active game', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current`)
      .auth(accessToken_1, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return my active game', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current`)
      .auth(accessToken_2, { type: 'bearer' })
      .expect(HttpStatus.NOT_FOUND);
  });

  // it('should not return game by id', async () => {
  //   await request(app.getHttpServer())
  //     .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/${'ggggg'}`) // createdGame.body.id
  //     .auth(accessToken_1, { type: 'bearer' })
  //     .expect(HttpStatus.BAD_REQUEST);
  // });
});
