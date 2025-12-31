import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionViewDto } from 'src/modules/user-accounts/dto/session/session-view.dto';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';
import { SessionsQueryRepository } from 'src/modules/user-accounts/infrastructure/query/sessions-query.repository';

export class GetAllSessionsQuery {
  constructor(public dto: UserContextDto) {}
}

@QueryHandler(GetAllSessionsQuery)
export class GetAllSessionsHandler
  implements IQueryHandler<GetAllSessionsQuery, SessionViewDto[]>
{
  constructor(
    private readonly sessionsQueryRepository: SessionsQueryRepository,
  ) {}

  async execute({ dto }: GetAllSessionsQuery): Promise<SessionViewDto[]> {
    return await this.sessionsQueryRepository.findManyForCurrentUser(
      Number(dto.id),
    );
  }
}
