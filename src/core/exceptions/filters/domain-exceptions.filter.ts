import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainException } from '../domain-exceptions';
import { Request, Response } from 'express';
import { DomainExceptionCode } from '../domain-exception-codes';
import { ErrorResponseBody } from './error-response-body.type';

//https://docs.nestjs.com/exception-filters#exception-filters-1
//Ошибки класса DomainException (instanceof DomainException)
@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    console.log(
      '[DomainHttpExceptionsFilter] Caught exception:',
      JSON.stringify(exception, null, 2),
    );

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.mapToHttpStatus(exception.code);
    // const responseBody = this.buildResponseBody(exception);

    if (Number(exception.code) === 400) {
      const responseBody = this.buildMyResponseBody(exception);
      console.log(5555555, responseBody, exception.code);

      response.status(exception.code).json(responseBody);
    } else {
      response.sendStatus(exception.code);
    }

    return;
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;
      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;
      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;
      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;
      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.I_AM_A_TEAPOT;
    }
  }

  private buildResponseBody(
    exception: DomainException,
    requestUrl: string,
  ): ErrorResponseBody {
    return {
      // timestamp: new Date().toISOString(),
      // path: requestUrl,
      // message: exception.message,
      // code: exception.code,
      // extensions: exception.extensions,
      //
      //  ok: 'true',

      // @ts-ignore
      errorsMessages: exception.extensions,
    };
  }

  private buildMyResponseBody(exception: DomainException): ErrorResponse {
    return {
      //@ts-ignore
      errorsMessages: exception.extensions,
    };
  }

  private buildMyResponseBodyBadRequest(
    exception: DomainException,
  ): ErrorResponse {
    return {
      //@ts-ignore
      errorsMessages: [
        { message: exception.message.split(' ')[0].toLowerCase(), field: '' },
      ],
    };
  }
}

//   errorsMessages: [{ message: Any<String>, field: 'email' }];
export type ErrorMessage = {
  message: string;
  field: string;
};

export type ErrorResponse = {
  errorsMessages: ErrorMessage[];
};
