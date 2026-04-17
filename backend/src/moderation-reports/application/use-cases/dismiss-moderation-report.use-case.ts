import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/entities/user.orm-entity';
import { ModerationReportOrmEntity } from '../../infrastructure/persistence/entities/moderation-report.orm-entity';

@Injectable()
export class DismissModerationReportUseCase {
  constructor(
    @InjectRepository(ModerationReportOrmEntity)
    private readonly reportRepo: Repository<ModerationReportOrmEntity>,
  ) {}

  async execute(
    reportId: string,
    adminUserId: string,
    reviewNote?: string | null,
  ): Promise<{ ok: true }> {
    const row = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!row) {
      throw new NotFoundException('Reporte no encontrado');
    }
    if (row.reviewStatus !== 'pending') {
      throw new BadRequestException('Este reporte ya fue revisado');
    }
    row.reviewStatus = 'dismissed';
    row.reviewedAt = new Date();
    row.reviewedBy = { id: adminUserId } as UserOrmEntity;
    row.reviewNote = reviewNote?.trim() || null;
    await this.reportRepo.save(row);
    return { ok: true };
  }
}
