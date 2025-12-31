import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentUpdateDto } from '../dto/comment/comment-update.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/usecases/comments/update-comment.usecase';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { UserContextDto } from 'src/modules/user-accounts/guards/dto/user-context.dto';
import { ExtractUserFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { LikeInputDto } from '../dto/like/like-input.dto';
import { UpdateCommentLikeStatusCommand } from '../application/usecases/comments/update-comment-like-status.usecase';
import { DeleteCommentCommand } from '../application/usecases/comments/delete-comment.usecase';
import { JwtOptionalAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from 'src/modules/user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { GetCommentCommand } from '../application/usecases/comments/get-comment.usecase';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('comments')
@SkipThrottle()
export class CommentsController {
  constructor(private commandBus: CommandBus) {}

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') id: string,
    @Body() body: CommentUpdateDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateCommentCommand(body, id, user.id));
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @Param('id') id: string,
    @Body() like: LikeInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(like, id, user.id),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommand(id, user.id));
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getComment(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto,
  ): Promise<void> {
    return await this.commandBus.execute(new GetCommentCommand(id, user?.id));
  }
}

// создать шину, зарегать, создать команду, обработчик
