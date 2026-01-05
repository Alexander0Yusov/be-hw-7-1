//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { PublishedStatus, QuestionSortField } from './question-sort-field';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetQuestionsQueryParams extends BaseQueryParams {
  @IsEnum(QuestionSortField)
  sortBy: QuestionSortField = QuestionSortField.CreatedAt;

  @IsEnum(PublishedStatus)
  publishedStatus: PublishedStatus = PublishedStatus.All;

  @IsString()
  @IsOptional()
  bodySearchTerm: string | null = null;
}
