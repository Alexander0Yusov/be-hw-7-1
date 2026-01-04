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
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create question', async () => {
    const newQuestion = {
      body: 'stringstri',
      correctAnswers: ['string'],
    };

    const createdQuestion = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .send(newQuestion)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.CREATED);

    const updatedQuestion = await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/sa/quiz/questions/${createdQuestion.body.id}`)
      .send(newQuestion)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.NO_CONTENT);
  });

  // it('should create user', async () => {
  //   // создание и логин юзера
  //   const newUser = createFakeUser('2');

  //   const createdUser = await request(app.getHttpServer())
  //     .post(`/${GLOBAL_PREFIX}/sa/users`)
  //     .send(newUser)
  //     .auth('admin', 'qwerty')
  //     .expect(HttpStatus.CREATED);

  //   console.log(9999, createdUser.body);

  //   const loginResponse = await request(app.getHttpServer())
  //     .post(`/${GLOBAL_PREFIX}/auth/login`)
  //     .send({ loginOrEmail: newUser.email, password: newUser.password })
  //     .expect(HttpStatus.OK);

  //   // accessToken из тела
  //   const accessToken = loginResponse.body.accessToken; // refreshToken из cookie

  //   const rawCookies = loginResponse.headers['set-cookie'];
  //   const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
  //   const refreshTokenCookie = cookies.find((c) =>
  //     c.startsWith('refreshToken='),
  //   );
  //   const refreshToken = refreshTokenCookie
  //     ?.split(';')[0]
  //     .replace('refreshToken=', '');

  //   console.log('accessToken:', accessToken);
  //   console.log('refreshToken:', refreshToken);
  // });
});
