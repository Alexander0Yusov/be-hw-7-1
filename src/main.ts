import { NestFactory } from '@nestjs/core';
import { appSetup } from './setup/app.setup';
import { initAppModule } from './init-app-module';
import { CoreConfig } from './core/core.config';

// Не экспортируйте ничего из main.ts, чтобы избежать повторного запуска приложения
// при выполнении тестов. (Node.js автоматически выполняет код импортируемого файла.)

async function bootstrap() {
  // выполнена реализация через динамич настройку
  // const app = await NestFactory.create(AppModule);

  const dynamicAppModule = await initAppModule();
  // создаём на основе донастроенного модуля наше приложение
  const app = await NestFactory.create(dynamicAppModule);

  appSetup(app);

  // const PORT = process.env.PORT || 5001;

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  const port = coreConfig.port;

  await app.listen(port, () => {
    console.log('Server is running on port ' + port);
  });
}

bootstrap();

// сервис логина перешел в юзкейсы и утратил актуальность
// внести в модуль юзкейсы девайса
