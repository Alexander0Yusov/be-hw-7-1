import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class QuestionInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(10, 500)
  body: string;

  @IsArray() // — проверка, что это именно массив.
  @ArrayNotEmpty() // — массив не должен быть пустым.
  @ArrayMinSize(1) // — минимальное количество элементов.
  @ArrayMaxSize(10) // — максимальное количество элементов.
  @IsNotEmpty({ each: true }) // — каждый элемент не пустой.
  @IsString({ each: true }) // — каждый элемент должен быть строкой.
  @Length(1, 300, { each: true }) // — длина каждой строки в массиве.
  correctAnswers: string[];
}
