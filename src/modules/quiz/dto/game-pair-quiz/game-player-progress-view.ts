import { AnswerView } from '../answer/answer-view';
import { PlayerView } from './player-view';

export class GamePlayerProgressView {
  answers: AnswerView[];
  player: PlayerView;
  score: number;
}
