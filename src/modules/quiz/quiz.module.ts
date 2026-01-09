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
import { MakeAnswerUseCase } from './application/usecases/answers/make-answer.usecase';
import { AnswersRepository } from './infrastructure/answers.repository';
import { AnswersQueryRepository } from './infrastructure/query/answers-query.repository';
import { GetMyCurrentHandler } from './application/usecases/games/get-my-current.query-handler';
import { GetGameByIdHandler } from './application/usecases/games/get-current-game-by-id.query-handler';
import { GameQuestion } from './domain/game-question/game-question.entity';
import { PlayerProgressRepository } from './infrastructure/player-progress.repository';

export const CommandHandlers = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  UpdateQuestionStatusUseCase,
  DeleteQuestionUseCase,
  //
  ConnectOrCreatePairUseCase,
  MakeAnswerUseCase,
  //
  GetQuestionHandler,
  GetMyCurrentHandler,
  GetGameByIdHandler,
];

@Module({
  imports: [
    UserAccountsModule,
    TypeOrmModule.forFeature([
      Game,
      PlayerProgress,
      Question,
      Answer,
      GameQuestion,
    ]),
  ],
  controllers: [SaQuestionsController, PairGameQuizController],
  providers: [
    ApplicationService,
    QuestionsRepository,
    QuestionsQueryRepository,
    //
    GamesRepository,
    GamesQueryRepository,
    //
    AnswersRepository,
    AnswersQueryRepository,
    //
    PlayerProgressRepository,
    ...CommandHandlers,
  ],
})
export class QuizModule {}
