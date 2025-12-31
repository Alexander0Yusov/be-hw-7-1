import { Injectable, NotFoundException } from '@nestjs/common';
import { MeViewDto, UserViewDto } from '../../dto/user/user-view.dto';
import { GetUsersQueryParams } from '../../dto/user/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { DataSource, ILike, IsNull, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/user/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findMeByIdOrNotFindFail(id: number): Promise<MeViewDto> {
    const user = await this.userRepo.findOne({
      where: { id, deletedAt: IsNull() },
      select: ['id', 'login', 'email'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: String(user.id),
      login: user.login,
      email: user.email,
    };
  }

  async findUserByIdOrNotFindFail(id: number): Promise<UserViewDto> {
    const user = await this.userRepo.findOne({
      where: { id, deletedAt: IsNull() },
      select: ['id', 'login', 'email', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserViewDto.mapToView(user);
  }

  async findAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const where: any[] = [];

    if (query.searchLoginTerm) {
      where.push({
        login: ILike(`%${query.searchLoginTerm}%`),
        deletedAt: IsNull(),
      });
    }

    if (query.searchEmailTerm) {
      where.push({
        email: ILike(`%${query.searchEmailTerm}%`),
        deletedAt: IsNull(),
      });
    }

    if (where.length === 0) {
      where.push({ deletedAt: IsNull() });
    }

    const [users, totalCount] = await this.userRepo.findAndCount({
      where,
      order: {
        [query.sortBy ?? 'createdAt']:
          query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      },
      skip: query.calculateSkip(),
      take: query.pageSize,
    });

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  // async findAll(
  //   query: GetUsersQueryParams,
  // ): Promise<PaginatedViewDto<UserViewDto[]>> {
  //   const values: any[] = [];
  //   const baseClause = 'deleted_at IS NULL';
  //   const searchClauses: string[] = [];

  //   if (query.searchLoginTerm) {
  //     values.push(`%${query.searchLoginTerm}%`);
  //     searchClauses.push(`login ILIKE $${values.length}`);
  //   }

  //   if (query.searchEmailTerm) {
  //     values.push(`%${query.searchEmailTerm}%`);
  //     searchClauses.push(`email ILIKE $${values.length}`);
  //   }

  //   let whereSql = `WHERE ${baseClause}`;
  //   if (searchClauses.length > 0) {
  //     whereSql += ` AND (${searchClauses.join(' OR ')})`;
  //   }

  //   const sortFieldMap: Record<string, string> = {
  //     login: 'login',
  //     email: 'email',
  //     createdAt: 'created_at',
  //   };

  //   const sortBy = sortFieldMap[query.sortBy];

  //   // по этим двум полям надо нечувствительный регистр
  //   const stringFields = ['login', 'email'];
  //   const sortField = stringFields.includes(sortBy)
  //     ? `${sortBy} COLLATE "C"`
  //     : sortBy;

  //   // Основной запрос
  //   const usersSql = `
  //   SELECT id, login, email, created_at
  //   FROM users ${whereSql}
  //   ORDER BY ${sortField} ${query.sortDirection.toUpperCase()}
  //   OFFSET ${query.calculateSkip()}
  //   LIMIT ${query.pageSize};
  // `;
  //   const users = await this.dataSource.query(usersSql, values);

  //   // Подсчёт общего количества
  //   const countSql = `SELECT COUNT(*) FROM users ${whereSql};`;
  //   const countResult = await this.dataSource.query(countSql, values);

  //   const totalCount = parseInt(countResult[0].count);

  //   let items = [];
  //   if (totalCount) {
  //     items = users.map(UserViewDto.mapToView);
  //   }

  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }
}
