import { IsString } from 'class-validator';

/**
 * user object for the jwt token and for transfer from the request object
 */
export class UserContextDto {
  @IsString()
  id: string;
}

export type Nullable<T> = { [P in keyof T]: T[P] | null };
