import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../core/exceptions/domain-exceptions';
import { ObjectIdValidationTransformationPipe } from '../core/pipes/object-id-validation-transformation-pipe.service';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-codes';

//функция использует рекурсию для обхода объекта children при вложенных полях при валидации
//поставьте логи и разберитесь как она работает
//TODO: tests
export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: any,
): Extension[] => {
  const errorsForResponse = errorMessage || [];

  console.log('Validation errors:', JSON.stringify(errors, null, 2));

  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      for (const key of constrainKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}`
            : '',
          field: error.property,
        });
      }
    }
  }

  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  app.useGlobalPipes(
    new ObjectIdValidationTransformationPipe(),
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,

      whitelist: true,
      //Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,
      //Для преобразования ошибок класс валидатора в необходимый вид
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          extensions: formattedErrors,
        });
      },
    }),
  );
}

// ======================================================================
// import { INestApplication, ValidationPipe } from '@nestjs/common';

// export function pipesSetup(app: INestApplication) {
//   //Глобальный пайп для валидации и трансформации входящих данных.
//   //На следующем занятии рассмотрим подробнее
//   app.useGlobalPipes(
//     new ValidationPipe({
//       //class-transformer создает экземпляр dto
//       //соответственно применятся значения по-умолчанию
//       //и методы классов dto
//       transform: true,
//     }),
//   );
// }
