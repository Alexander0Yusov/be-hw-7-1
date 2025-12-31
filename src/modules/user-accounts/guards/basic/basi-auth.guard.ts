import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class BasicAuthGuard extends AuthGuard('basic') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('🔥 BasicAuthGuard activated');
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser): TUser {
    if (err || !user) {
      throw (
        err ||
        new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: 'Invalid login or password',
        })
      );
    }

    return user as TUser;
  }
}
