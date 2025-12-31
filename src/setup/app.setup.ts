import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { DomainHttpExceptionsFilter } from '../core/exceptions/filters/domain-exceptions.filter';
import { AllHttpExceptionsFilter } from '../core/exceptions/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app);

  // validationConstraintSetup(app);
  // exceptionFilterSetup(app);

  //... etc

  // порядок регистрации оч важен
  app.useGlobalFilters(
    new AllHttpExceptionsFilter(),
    new DomainHttpExceptionsFilter(),
  );
  app.use(cookieParser());
  app.enableCors();
}
