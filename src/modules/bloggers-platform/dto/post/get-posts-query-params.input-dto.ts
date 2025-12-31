//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { IsEnum } from 'class-validator';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { PostSortField } from './post-sort-field';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetPostsQueryParams extends BaseQueryParams {
  @IsEnum(PostSortField)
  sortBy: PostSortField = PostSortField.CreatedAt;
  // searchNameTerm: string | null = null;
}
