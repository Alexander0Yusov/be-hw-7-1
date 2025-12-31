import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UserInputDto } from '../dto/user/user-input.dto';
import { UserViewDto } from '../dto/user/user-view.dto';
import { UsersQueryRepository } from '../infrastructure/query/users-query.repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../dto/user/get-users-query-params.input-dto';
import { UpdateUserDto } from '../dto/user/create-user-domain.dto';
import { BasicAuthGuard } from '../guards/basic/basi-auth.guard';
import { UsersRepository } from '../infrastructure/users.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/users/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/users/delete-user.usecase';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller()
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post('users')
  async create(@Body() dto: UserInputDto): Promise<UserViewDto | null> {
    // const userId = await this.usersService.createUser(dto);

    return null;
  }

  @Get('users/:id')
  async getById(@Param('id') id: string): Promise<UserViewDto | null> {
    // return this.usersQueryRepository.findByIdOrNotFoundFail(id);
    return null;
  }

  @Get('users')
  // @UseGuards(BasicAuthGuard)
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]> | string> {
    // return await this.usersQueryRepository.getAll(query);

    return '';
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserViewDto | null> {
    // const userId = await this.usersService.update(id, body);
    // return this.usersQueryRepository.findByIdOrNotFoundFail('userId');
    return null;
  }

  @Delete('users/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    // return this.usersService.deleteUser(id);
  }

  //
  @Post('sa/users')
  @UseGuards(BasicAuthGuard)
  async createBySa(@Body() dto: UserInputDto): Promise<UserViewDto | null> {
    // const userId = await this.usersService.createUser(dto);

    const userId = await this.commandBus.execute(new CreateUserCommand(dto));
    return await this.usersQueryRepository.findUserByIdOrNotFindFail(userId);
  }

  @Get('sa/users')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllBySa(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    // return await this.usersQueryRepository.getAll(query);
    return await this.usersQueryRepository.findAll(query);
  }

  @Delete('sa/users/:id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBySa(@Param('id') id: string): Promise<void> {
    // return this.usersService.deleteUser(id);
    await this.commandBus.execute(new DeleteUserCommand({ id }));
  }
}
