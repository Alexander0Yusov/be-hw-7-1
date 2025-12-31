//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { IsEnum } from 'class-validator';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { CommentSortField } from './comment-sort-field';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetCommentsQueryParams extends BaseQueryParams {
  @IsEnum(CommentSortField)
  sortBy: CommentSortField = CommentSortField.CreatedAt;
}
