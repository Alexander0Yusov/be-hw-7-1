import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { Trim } from 'src/core/decorators/transform/trim';

export class BlogInputDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(15)
  name: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsString()
  @Trim()
  @MaxLength(100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
    {
      message: 'websiteUrl must be a valid HTTPS URL',
    },
  )
  websiteUrl: string;
}
