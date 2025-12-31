import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { AuthService } from './application/auth.service';
import { SecurityDevicesService } from './application/security-devices.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users-query.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { CryptoService } from './application/crupto.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BasicStrategy } from './guards/basic/basic.strategy';
import { UserAccountsConfig } from './user-accounts.config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { CoreConfig } from 'src/core/core.config';
import { RefreshJwtStrategy } from './guards/bearer-refresh/refresh-jwt.strategy';
import { SessionsRepository } from './infrastructure/sessions.repository';
import { SessionsQueryRepository } from './infrastructure/query/sessions-query.repository';
import { CreateTokensPairUseCase } from './application/usecases/auth/create-tokens-pair.usecase';
import { CreateSessionUseCase } from './application/usecases/sessions/create-session.usecase';
import { RevokingSessionUseCase } from './application/usecases/sessions/revoking-session.usecase';
import { TerminateAllExcludeCurrentSessionUseCase } from './application/usecases/sessions/terminate-all-exclude-current-session.usecase';
import { GetAllSessionsHandler } from './application/usecases/sessions/get-all-sessions.query-handler';
import { TerminateByIdUseCase } from './application/usecases/sessions/terminate-by-id-session.usecase';
import { UpdateSessionUseCase } from './application/usecases/sessions/update-session.usecase';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CreateUserUseCase } from './application/usecases/users/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/users/delete-user.usecase';
import { AuthEmailConfirmationUseCase } from './application/usecases/auth/auth-email-confirmation.usecase';
import { AuthEmailResendConfirmationUseCase } from './application/usecases/auth/auth-email-resend-confirmation.usecase';
import { AuthRegisterUseCase } from './application/usecases/auth/auth-register.usecase';
import { GetMeHandler } from './application/usecases/auth/get-me.query-handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user/user.entity';
import { EmailConfirmation } from './domain/user/email-confirmation.entity';
import { PasswordRecovery } from './domain/user/password-recovery.entity';
import { Session } from './domain/session/session.entity';

export const CommandHandlers = [
  CreateTokensPairUseCase,
  CreateSessionUseCase,
  UpdateSessionUseCase,
  RevokingSessionUseCase,
  TerminateByIdUseCase,
  TerminateAllExcludeCurrentSessionUseCase,
  //
  CreateUserUseCase,
  DeleteUserUseCase,

  AuthEmailConfirmationUseCase,
  AuthEmailResendConfirmationUseCase,
  AuthRegisterUseCase,
];

export const QueryHandlers = [GetAllSessionsHandler, GetMeHandler];

@Module({
  imports: [
    NotificationsModule,
    JwtModule,
    TypeOrmModule.forFeature([
      User,
      EmailConfirmation,
      PasswordRecovery,
      Session,
    ]),
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    UserAccountsConfig,
    //
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    //
    AuthService,

    //
    CryptoService,
    //
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    //
    SecurityDevicesService,
    //
    SessionsRepository,
    SessionsQueryRepository,

    ...CommandHandlers,
    ...QueryHandlers,
    //
    //пример инстанцирования через токен
    //если надо внедрить несколько раз один и тот же класс
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (coreConfig: CoreConfig): JwtService => {
        return new JwtService({
          secret: coreConfig.accessTokenSecret,
          signOptions: { expiresIn: coreConfig.accessTokenExpireIn },
        });
      },
      inject: [CoreConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (coreConfig: CoreConfig): JwtService => {
        return new JwtService({
          secret: coreConfig.refreshTokenSecret,
          signOptions: { expiresIn: coreConfig.refreshTokenExpireIn },
        });
      },
      inject: [CoreConfig],
    },
    //
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [UsersQueryRepository],
})
export class UserAccountsModule {}
