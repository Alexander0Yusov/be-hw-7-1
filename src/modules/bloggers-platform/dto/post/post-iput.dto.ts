import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from 'src/core/decorators/transform/trim';

export class PostInputDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  blogId: string;
}
