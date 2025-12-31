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
import { EmailService } from '../src/modules/mailer/email.service';
import { EmailServiceMock } from './mock/email-service.mock';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from 'src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from 'src/core/core.config';

describe('users (e2e)', () => {
  let app: INestApplication<App>;
  let userTestManger: UsersTestManager;
  let emailServiceMock: EmailServiceMock;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (coreConfig: CoreConfig) => {
            return new JwtService({
              secret: coreConfig.accessTokenSecret,
              signOptions: { expiresIn: '2s' },
            });
          },
          inject: [CoreConfig],
        }),
    );

    app = result.app;
    userTestManger = result.userTestManger;

    // этот мок вызывается в боевом коде если ему дать
    // emailServiceMock = app.get(EmailService) as EmailServiceMock;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await app.close();
  });

  // it('should get users with paging', async () => {
  //   const users = await userTestManger.createSeveralUsers(12);

  //   const { body: responseBody } = (await request(app.getHttpServer())
  //     .get(`/${GLOBAL_PREFIX}/users?pageNumber=2&sortDirection=asc`)
  //     .auth('admin', 'qwerty')
  //     .expect(HttpStatus.OK)) as { body: PaginatedViewDto<UserViewDto> };

  //   expect(responseBody.totalCount).toBe(12);
  //   expect(responseBody.items).toHaveLength(2);
  //   expect(responseBody.pagesCount).toBe(2);
  //   //asc sorting
  //   expect(responseBody.items[1]).toEqual(users[users.length - 1]);
  //   //etc...
  // });

  // it('should return users info while "me" request with correct accessTokens', async () => {
  //   const tokens = await userTestManger.createAndLoginSeveralUsers(1);

  //   const responseBody = await userTestManger.me(tokens[0].accessToken);

  //   expect(responseBody).toEqual({
  //     login: expect.anything(),
  //     userId: expect.anything(),
  //     email: expect.anything(),
  //   } as MeViewDto);
  // });

  // it(`shouldn't return users info while "me" request if accessTokens expired`, async () => {
  //   const tokens = await userTestManger.createAndLoginSeveralUsers(1);
  //   await delay(2000);
  //   await userTestManger.me(tokens[0].accessToken, HttpStatus.UNAUTHORIZED);
  // });

  // it(`should register user without really send email`, async () => {
  //   await request(app.getHttpServer())
  //     .post(`/${GLOBAL_PREFIX}/auth/registration`)
  //     .send({
  //       email: 'email@email.em',
  //       password: '123123123',
  //       login: 'login123',
  //     } as UserInputDto)
  //     .expect(HttpStatus.CREATED);
  // });

  // it(`should call email sending method while registration`, async () => {
  //   EmailServiceMock.sendConfirmationEmailMock.mockReset();

  //   await request(app.getHttpServer())
  //     .post(`/${GLOBAL_PREFIX}/auth/registration`)
  //     .send({
  //       email: 'email@email.em',
  //       password: '123123123',
  //       login: 'login123',
  //     })
  //     .expect(HttpStatus.CREATED);

  //   expect(EmailServiceMock.sendConfirmationEmailMock).toHaveBeenCalled();
  // });

  // it('should send a letter if user exists but not confirmed', async () => {
  //   const body: UserInputDto = {
  //     login: 'yusovsky',
  //     password: 'qwerty',
  //     email: 'yusovsky2@gmail.com',
  //   };

  //   await userTestManger.createUser(body);

  //   const response = await request(app.getHttpServer())
  //     .post(`/${GLOBAL_PREFIX}/auth/registration-email-resending`)
  //     .send({ email: 'yusovsky2@gmail.com' })
  //     .expect(204);

  // console.log(2222, response.body);

  // expect(response).toEqual({
  //   login: body.login,
  //   email: body.email,
  //   id: expect.any(String),
  //   createdAt: expect.any(String),
  // });
  // });

  it('should create user', async () => {
    const body: UserInputDto = {
      login: 'name1s',
      password: 'qwerty',
      email: 'emails@email.em',
    };

    const response = await userTestManger.createUser(body);

    console.log(11111, response);

    expect(response).toEqual({
      login: body.login,
      email: body.email,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
  });
});
