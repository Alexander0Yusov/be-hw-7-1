import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewDto } from 'src/modules/user-accounts/dto/user/user-view.dto';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';
import { UsersQueryRepository } from 'src/modules/user-accounts/infrastructure/query/users-query.repository';

export class GetMeQuery {
  constructor(public dto: UserContextDto) {}
}

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, MeViewDto> {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async execute({ dto }: GetMeQuery): Promise<MeViewDto> {
    return await this.usersQueryRepository.findMeByIdOrNotFindFail(
      Number(dto.id),
    );
  }
}
