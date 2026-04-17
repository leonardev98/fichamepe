import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/infrastructure/guards/roles.guard';
import { Roles } from '../auth/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../auth/infrastructure/decorators/current-user.decorator';
import type { RequestUser } from '../auth/domain/services/auth-token.service.interface';
import { UserRole } from '../users/domain/entities/user';
import { RequestClientRequestChangesBodyDto } from './application/dto/request-client-request-changes.dto';
import { RequestServiceChangesBodyDto } from './application/dto/request-service-changes.dto';
import { ApproveClientRequestUseCase } from './application/use-cases/approve-client-request.use-case';
import { ListClientRequestReviewQueueUseCase } from './application/use-cases/list-client-request-review-queue.use-case';
import { ListReviewQueueUseCase } from './application/use-cases/list-review-queue.use-case';
import { ApproveServicePublicationUseCase } from './application/use-cases/approve-service-publication.use-case';
import { RequestClientRequestChangesUseCase } from './application/use-cases/request-client-request-changes.use-case';
import { RequestServiceChangesUseCase } from './application/use-cases/request-service-changes.use-case';
import { ListModerationReportsQueryDto } from '../moderation-reports/application/dto/list-moderation-reports-query.dto';
import { ReviewModerationReportBodyDto } from '../moderation-reports/application/dto/review-moderation-report.dto';
import { ApplyModerationReportUseCase } from '../moderation-reports/application/use-cases/apply-moderation-report.use-case';
import { DismissModerationReportUseCase } from '../moderation-reports/application/use-cases/dismiss-moderation-report.use-case';
import { ListModerationReportsAdminUseCase } from '../moderation-reports/application/use-cases/list-moderation-reports-admin.use-case';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class AdminController {
  constructor(
    private readonly listReviewQueue: ListReviewQueueUseCase,
    private readonly approveService: ApproveServicePublicationUseCase,
    private readonly requestServiceChanges: RequestServiceChangesUseCase,
    private readonly listClientRequestReviewQueue: ListClientRequestReviewQueueUseCase,
    private readonly approveClientRequestUc: ApproveClientRequestUseCase,
    private readonly requestClientRequestChangesUc: RequestClientRequestChangesUseCase,
    private readonly listModerationReports: ListModerationReportsAdminUseCase,
    private readonly dismissReportUc: DismissModerationReportUseCase,
    private readonly applyReportUc: ApplyModerationReportUseCase,
  ) {}

  @Get('services/review-queue')
  reviewQueue() {
    return this.listReviewQueue.execute();
  }

  @Patch('services/:id/approve')
  approve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.approveService.execute(id, user.userId);
  }

  @Patch('services/:id/request-changes')
  requestChanges(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: RequestServiceChangesBodyDto,
  ) {
    return this.requestServiceChanges.execute(id, user.userId, body.comment);
  }

  @Get('client-requests/review-queue')
  clientRequestReviewQueue() {
    return this.listClientRequestReviewQueue.execute();
  }

  @Patch('client-requests/:id/approve')
  approveClientRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.approveClientRequestUc.execute(id, user.userId);
  }

  @Patch('client-requests/:id/request-changes')
  requestClientRequestChanges(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: RequestClientRequestChangesBodyDto,
  ) {
    return this.requestClientRequestChangesUc.execute(id, user.userId, body.comment);
  }

  @Get('moderation-reports')
  moderationReports(@Query() query: ListModerationReportsQueryDto) {
    const reviewStatus = query.reviewStatus ?? 'pending';
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    return this.listModerationReports.execute({
      reviewStatus: reviewStatus === 'all' ? 'all' : reviewStatus,
      targetType: query.targetType,
      limit,
      offset,
    });
  }

  @Patch('moderation-reports/:id/dismiss')
  dismissModerationReport(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: ReviewModerationReportBodyDto,
  ) {
    return this.dismissReportUc.execute(id, user.userId, body.reviewNote);
  }

  @Patch('moderation-reports/:id/apply')
  applyModerationReport(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: ReviewModerationReportBodyDto,
  ) {
    return this.applyReportUc.execute(id, user.userId, body.reviewNote);
  }
}
