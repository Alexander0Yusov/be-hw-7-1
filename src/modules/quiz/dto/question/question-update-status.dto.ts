import { IsBoolean, IsNotEmpty } from 'class-validator';

export class QuestionUpdateStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  published: boolean;
}
