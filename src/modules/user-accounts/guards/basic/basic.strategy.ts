import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as PassportBasicStrategy } from 'passport-http';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BasicStrategy extends PassportStrategy(
  PassportBasicStrategy,
  'basic',
) {
  constructor() {
    super(); // 'passport-http' — работает с Authorization: Basic ...
  }

  async validate(
    login: string,
    password: string,
  ): Promise<Record<string, string>> {
    if (login !== 'admin' || password !== 'qwerty') {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid login or password',
      });
    }

    return {
      login: 'admin',
      email: 'admin@example.com',
    };
  }
}
