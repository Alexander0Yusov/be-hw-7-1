import { Game } from '../../domain/game/game.entity';
import { PlayerProgress } from '../../domain/player-progress/player-progress.entity';
import { AnswerStatuses, GameStatuses } from './answer-status';
import { GamePlayerProgressView } from './game-player-progress-view';

export class PostConnectionViewDto {
  id: string;
  firstPlayerProgress: GamePlayerProgressView;
  secondPlayerProgress: null | GamePlayerProgressView;
  questions: { id: string; body: string }[] | null;
  status: GameStatuses;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;

  static mapFrom(game: Game): PostConnectionViewDto {
    return {
      id: game.id.toString(),
      status: game.status,
      pairCreatedDate: game.createdAt,
      startGameDate: game.secondPlayerProgress
        ? game.secondPlayerProgress.createdAt
        : null,
      finishGameDate: null, // можно вычислить по последнему ответу
      firstPlayerProgress: PostConnectionViewDto.mapProgress(
        game.firstPlayerProgress,
      ),
      secondPlayerProgress: game.secondPlayerProgress
        ? PostConnectionViewDto.mapProgress(game.secondPlayerProgress)
        : null,
      questions: game.questions
        ? game.questions.map((q) => ({ id: q.id.toString(), body: q.body }))
        : null,
    };
  }
  private static mapProgress(pp: PlayerProgress): GamePlayerProgressView {
    return {
      player: { id: pp.user.id.toString(), login: pp.user.login },

      score:
        pp.answers.filter((a) => a.status === AnswerStatuses.Correct).length ??
        0,

      answers: pp.answers.map((a) => ({
        questionId: a.question.id.toString(),
        answerStatus: a.status,
        addedAt: a.createdAt.toISOString(),
      })),
    };
  }
}
