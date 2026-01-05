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
import { UpdateQuestionStatusUseCase } from './application/usecases/questions/update-question-status.usecase';
import { DeleteQuestionUseCase } from './application/usecases/questions/delete-question.usecase';
import { PairGameQuizController } from './api/pair-game-quiz.controller';
import { ConnectOrCreatePairUseCase } from './application/usecases/games/connect-or-create-pair.usecase';
import { GamesRepository } from './infrastructure/games.repository';
import { GamesQueryRepository } from './infrastructure/query/games-query.repository';

export const CommandHandlers = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  UpdateQuestionStatusUseCase,
  DeleteQuestionUseCase,
  GetQuestionHandler,
  //
  ConnectOrCreatePairUseCase,
];

@Module({
  imports: [
    UserAccountsModule,
    TypeOrmModule.forFeature([Game, PlayerProgress, Question, Answer]),
  ],
  controllers: [SaQuestionsController, PairGameQuizController],
  providers: [
    ApplicationService,
    QuestionsRepository,
    QuestionsQueryRepository,
    //
    GamesRepository,
    GamesQueryRepository,
    ...CommandHandlers,
  ],
})
export class QuizModule {}
