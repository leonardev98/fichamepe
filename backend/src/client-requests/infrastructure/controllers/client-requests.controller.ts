import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import type { RequestUser } from '../../../auth/domain/services/auth-token.service.interface';
import { AddClientRequestCommentBodyDto } from '../../application/dto/add-client-request-comment.dto';
import { CreateClientRequestBodyDto } from '../../application/dto/create-client-request.dto';
import { ListCommentsQueryDto } from '../../application/dto/list-comments-query.dto';
import { ListMineClientRequestsQueryDto } from '../../application/dto/list-mine-query.dto';
import { ListOpenClientRequestsQueryDto } from '../../application/dto/list-open-client-requests-query.dto';
import { UpdateClientRequestBodyDto } from '../../application/dto/update-client-request.dto';
import { AddClientRequestCommentUseCase } from '../../application/use-cases/add-client-request-comment.use-case';
import { ApplyToClientRequestUseCase } from '../../application/use-cases/apply-to-client-request.use-case';
import { CreateClientRequestUseCase } from '../../application/use-cases/create-client-request.use-case';
import { GetPublicClientRequestUseCase } from '../../application/use-cases/get-public-client-request.use-case';
import { ListClientRequestCommentsUseCase } from '../../application/use-cases/list-client-request-comments.use-case';
import { ListMyClientRequestsUseCase } from '../../application/use-cases/list-my-client-requests.use-case';
import { ListOpenClientRequestsUseCase } from '../../application/use-cases/list-open-client-requests.use-case';
import { ResubmitClientRequestUseCase } from '../../application/use-cases/resubmit-client-request.use-case';
import { UpdateClientRequestUseCase } from '../../application/use-cases/update-client-request.use-case';

@Controller('client-requests')
export class ClientRequestsController {
  constructor(
    private readonly listOpen: ListOpenClientRequestsUseCase,
    private readonly listMine: ListMyClientRequestsUseCase,
    private readonly getPublic: GetPublicClientRequestUseCase,
    private readonly listComments: ListClientRequestCommentsUseCase,
    private readonly addComment: AddClientRequestCommentUseCase,
    private readonly createRequest: CreateClientRequestUseCase,
    private readonly updateRequest: UpdateClientRequestUseCase,
    private readonly resubmitRequest: ResubmitClientRequestUseCase,
    private readonly applyToRequest: ApplyToClientRequestUseCase,
  ) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  mine(
    @CurrentUser() user: RequestUser,
    @Query() query: ListMineClientRequestsQueryDto,
  ) {
    const status = query.status ?? 'all';
    return this.listMine.execute(user.userId, status);
  }

  @Get()
  list(@Query() query: ListOpenClientRequestsQueryDto) {
    const limit = query.limit ?? 30;
    return this.listOpen.execute(limit);
  }

  @Get(':id/comments')
  listCommentsForRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: ListCommentsQueryDto,
  ) {
    const limit = query.limit ?? 30;
    const offset = query.offset ?? 0;
    return this.listComments.execute(id, limit, offset);
  }

  @Get(':id')
  getOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.getPublic.execute(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateClientRequestBodyDto,
  ) {
    return this.createRequest.execute(user.userId, {
      title: body.title,
      detail: body.detail,
      budget: body.budget,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  patch(
    @CurrentUser() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateClientRequestBodyDto,
  ) {
    return this.updateRequest.execute(id, user.userId, {
      title: body.title,
      detail: body.detail,
      budget: body.budget,
    });
  }

  @Post(':id/resubmit')
  @UseGuards(JwtAuthGuard)
  resubmit(
    @CurrentUser() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.resubmitRequest.execute(id, user.userId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  postComment(
    @CurrentUser() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AddClientRequestCommentBodyDto,
  ) {
    return this.addComment.execute(id, user.userId, body.body);
  }

  @Post(':id/applications')
  @UseGuards(JwtAuthGuard)
  apply(
    @CurrentUser() user: RequestUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.applyToRequest.execute(id, user.userId);
  }
}
