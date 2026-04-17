import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import type { RequestUser } from '../../../auth/domain/services/auth-token.service.interface';
import { CreateModerationReportDto } from '../../application/dto/create-moderation-report.dto';
import { CreateModerationReportUseCase } from '../../application/use-cases/create-moderation-report.use-case';

@Controller('moderation-reports')
@UseGuards(JwtAuthGuard)
export class ModerationReportsController {
  constructor(
    private readonly createReport: CreateModerationReportUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateModerationReportDto,
  ) {
    return this.createReport.execute(user.userId, body);
  }
}
