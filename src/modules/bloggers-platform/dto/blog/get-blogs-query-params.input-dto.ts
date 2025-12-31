//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { BlogSortField } from './blog-sort-field';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetBlogsQueryParams extends BaseQueryParams {
  @IsEnum(BlogSortField)
  sortBy: BlogSortField = BlogSortField.CreatedAt;

  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}
