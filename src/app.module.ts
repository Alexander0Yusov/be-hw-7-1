// важно configModule импортировать первым
import { configModule } from './config-dynamic-module';

import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user-accounts/domain/user/user.entity';

// nest g module modules/user-accounts
// nest g controller modules/user-accounts --no-spec
// nest g service modules/user-accounts --no-spec

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'postgres',
    //   password: 'sa',
    //   database: 'bloggers_platform',
    //   synchronize: true, // ❗ Только для разработки
    //   autoLoadEntities: true,
    //   logging: true,
    // }),

    // эту хрень в статик асинк модуля этого вроде как
    TypeOrmModule.forRootAsync({
      imports: [CoreModule],
      useFactory: (coreConfig: CoreConfig) => {
        return {
          type: 'postgres',
          host: coreConfig.postgresHost,
          port: coreConfig.postgresPort,
          username: coreConfig.postgresUser,
          password: coreConfig.postgresPassword,
          database: coreConfig.postgresDatabase,
          // entities: [__dirname + '/../**/*.entity.{ts,js}'], // либо поштучно перчислить каждую сущность
          synchronize: true, // ❗ Только для разработки
          autoLoadEntities: true,
          logging: true,
        };
      },
      inject: [CoreConfig],
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 10000,
          limit: 5,
        },
      ],
    }),

    BloggersPlatformModule,
    UserAccountsModule,
    NotificationsModule,
    MailerModule,
    CoreModule,
    configModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    return {
      module: AppModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])],
    };
  }
}
