import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from 'src/setup/config-validation.utility';
import { IsExpiresInFormat } from './decorators/transform/is-expires-in-format';
import { JwtSignOptions } from '@nestjs/jwt';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

// each module has it's own *.config.ts

@Injectable()
export class CoreConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number;

  //
  @IsNotEmpty({
    message: 'Set Env variable POSTGRES_HOST',
  })
  postgresHost: string;

  @IsNumber(
    {},
    {
      message: 'Set Env variable POSTGRES_PORT, example: 5000',
    },
  )
  postgresPort: number;

  @IsNotEmpty({
    message: 'Set Env variable POSTGRES_USER',
  })
  postgresUser: string;

  @IsNotEmpty({
    message: 'Set Env variable POSTGRES_PASSWORD, dangerous for security!',
  })
  postgresPassword: string;

  @IsNotEmpty({
    message: 'Set Env variable POSTGRES_DATABASE name',
  })
  postgresDatabase: string;
  //

  @IsEnum(Environments, {
    message:
      'Ser correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string;

  //...

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string;

  @IsNotEmpty({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE, dangerous for app lifecycle!',
  })
  includeTestingModule: boolean;

  @IsNotEmpty({
    message:
      'Set Env variable ACCESS_TOKEN_EXPIRE_IN, dangerous for security!!',
  })
  @IsExpiresInFormat({
    message: 'expiresIn должен быть числом или строкой вида "24h", "7d", "60s"',
  })
  accessTokenExpireIn: JwtSignOptions['expiresIn'];

  @IsNotEmpty({
    message:
      'Set Env variable REFRESH_TOKEN_EXPIRE_IN, dangerous for security!!',
  })
  @IsExpiresInFormat({
    message: 'expiresIn должен быть числом или строкой вида "24h", "7d", "60s"',
  })
  refreshTokenExpireIn: JwtSignOptions['expiresIn'];

  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));
    //
    this.postgresHost = this.configService.get('POSTGRES_HOST');
    this.postgresPort = Number(this.configService.get('POSTGRES_PORT'));
    this.postgresUser = this.configService.get('POSTGRES_USER');
    this.postgresPassword = this.configService.get('POSTGRES_PASSWORD');
    this.postgresDatabase = this.configService.get('POSTGRES_DATABASE');
    //
    this.env = this.configService.get('NODE_ENV');
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');
    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    this.includeTestingModule = Boolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    );

    console.log('INCLUDE_TESTING_MODULE =', this.includeTestingModule);

    this.accessTokenExpireIn = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');
    this.refreshTokenExpireIn = this.configService.get(
      'REFRESH_TOKEN_EXPIRE_IN',
    );

    configValidationUtility.validateConfig(this);
  }
}
