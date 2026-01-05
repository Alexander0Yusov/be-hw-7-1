import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AnswerInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  answer: string;
}
