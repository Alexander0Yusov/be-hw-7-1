import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';

// Мы используем AuthGuard, предоставляемый пакетом @nestjs/passport, который автоматически
// активируется при расширении стратегии passport - local. Локальная стратегия Passport имеет
// имя по умолчанию 'local', что позволяет однозначно связывать её с функциональностью,
// реализованной в пакете passport - local

//этот гард вешаем на логин. Через локальную стратегию проверяются логин и пароль пользователя
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // handleRequest(err, user, info, context) {
  //   if (err) {
  //     // Пробрасываем DomainException, если он был
  //     if (err instanceof DomainException) {
  //       throw err;
  //     }
  //     throw new UnauthorizedException(err.message);
  //   }
  //   if (!user) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.Unauthorized,
  //       message: 'Invalid login or password',
  //       extensions: [{ message: 'Invalid login or password', key: 'login' }],
  //     });
  //   }
  //   return user;
  // }
}
