import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CommentUpdateDto } from 'src/modules/bloggers-platform/dto/comment/comment-update.dto';
import { BasicAuthGuard } from 'src/modules/user-accounts/guards/basic/basi-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';
import { QuestionInputDto } from '../dto/question/question-create.dto';
import { CreateQuestionCommand } from '../application/usecases/questions/create-question.usecase';
import { QuestionViewDto } from '../dto/question/question-view.dto';
import { GetQuestionQuery } from '../application/usecases/questions/get-question.query-handler';
import { UpdateQuestionCommand } from '../application/usecases/questions/update-question.usecase';

@Controller('sa/quiz/questions')
export class SaQuestionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    //  private usersService: UsersService,
    //  private usersRepository: UsersRepository,
    //  private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async createQuestion(
    @Body() body: QuestionInputDto,
  ): Promise<QuestionViewDto> {
    const questionId = await this.commandBus.execute(
      new CreateQuestionCommand(body),
    );

    return await this.queryBus.execute(new GetQuestionQuery(questionId));
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id') id: string,
    @Body() body: QuestionInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateQuestionCommand(body, id));
  }
}
