import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { CoreConfig } from '../../src/core/core.config';
import { appSetup } from '../../src/setup/app.setup';

export async function initTestApp(): Promise<INestApplication> {
  // временный контекст, чтобы достать CoreConfig
  const tempContext = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const tempApp = tempContext.createNestApplication();
  await tempApp.init();
  const coreConfig = tempApp.get(CoreConfig);
  await tempApp.close();

  // полноценный модуль
  const dynamicModule = await AppModule.forRoot(coreConfig);
  const moduleRef = await Test.createTestingModule({
    imports: [dynamicModule],
  }).compile();
  const app = moduleRef.createNestApplication();

  appSetup(app);
  await app.init();

  return app;
}
