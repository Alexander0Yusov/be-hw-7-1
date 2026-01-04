import { Module } from '@nestjs/common';

import { ApplicationService } from './application/application.service';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaQuestionsController } from './api/sa-questions.controller';
import { Game } from './domain/game/game.entity';
import { PlayerProgress } from './domain/player-progress/player-progress.entity';
import { Question } from './domain/question/question.entity';
import { Answer } from './domain/answer/answer.entity';
import { CreateQuestionUseCase } from './application/usecases/questions/create-question.usecase';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { QuestionsQueryRepository } from './infrastructure/query/questions-query.repository';
import { GetQuestionHandler } from './application/usecases/questions/get-question.query-handler';
import { UpdateQuestionUseCase } from './application/usecases/questions/update-question.usecase';

export const CommandHandlers = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  GetQuestionHandler,
];

@Module({
  imports: [
    UserAccountsModule,
    TypeOrmModule.forFeature([Game, PlayerProgress, Question, Answer]),
  ],
  controllers: [SaQuestionsController],
  providers: [
    ApplicationService,
    QuestionsRepository,
    QuestionsQueryRepository,
    ...CommandHandlers,
  ],
})
export class QuizModule {}
