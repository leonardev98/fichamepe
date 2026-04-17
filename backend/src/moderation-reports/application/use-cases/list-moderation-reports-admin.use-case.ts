import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ClientRequestCommentOrmEntity } from '../../../client-requests/infrastructure/persistence/entities/client-request-comment.orm';
import { ClientRequestOrmEntity } from '../../../client-requests/infrastructure/persistence/entities/client-request.orm';
import { ServiceOrmEntity } from '../../../services/infrastructure/persistence/entities/service.orm';
import { ProfileOrmEntity } from '../../../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/entities/user.orm-entity';
import {
  ModerationReportOrmEntity,
  type ModerationReviewStatus,
  type ModerationTargetType,
} from '../../infrastructure/persistence/entities/moderation-report.orm-entity';

export type AdminModerationReportRow = {
  id: string;
  targetType: ModerationTargetType;
  targetId: string;
  /** Para comentarios: id de la solicitud padre (enlace en admin UI). */
  parentClientRequestId: string | null;
  /** Si targetType=user: id del perfil para /perfil/:id */
  subjectProfileId: string | null;
  reason: string;
  details: string | null;
  reviewStatus: ModerationReviewStatus;
  reviewNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  reporter: {
    id: string;
    email: string;
    fullName: string | null;
  };
  targetSummary: string;
};

@Injectable()
export class ListModerationReportsAdminUseCase {
  constructor(
    @InjectRepository(ModerationReportOrmEntity)
    private readonly reportRepo: Repository<ModerationReportOrmEntity>,
    @InjectRepository(ServiceOrmEntity)
    private readonly serviceRepo: Repository<ServiceOrmEntity>,
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    @InjectRepository(ClientRequestCommentOrmEntity)
    private readonly commentRepo: Repository<ClientRequestCommentOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(ProfileOrmEntity)
    private readonly profileRepo: Repository<ProfileOrmEntity>,
  ) {}

  async execute(params: {
    reviewStatus: ModerationReviewStatus | 'all';
    targetType?: ModerationTargetType;
    limit: number;
    offset: number;
  }): Promise<{ reports: AdminModerationReportRow[]; total: number }> {
    const qb = this.reportRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.reporter', 'reporter')
      .orderBy('r.createdAt', 'DESC');

    if (params.reviewStatus !== 'all') {
      qb.andWhere('r.reviewStatus = :rs', { rs: params.reviewStatus });
    }
    if (params.targetType) {
      qb.andWhere('r.targetType = :tt', { tt: params.targetType });
    }

    const total = await qb.clone().getCount();
    const rows = await qb
      .skip(params.offset)
      .take(params.limit)
      .getMany();

    const { summaries, parentRequestByCommentId, profileIdByUserId } =
      await this.buildSummaries(rows);
    const reports: AdminModerationReportRow[] = rows.map((r) => ({
      id: r.id,
      targetType: r.targetType,
      targetId: r.targetId,
      parentClientRequestId:
        r.targetType === 'client_request_comment'
          ? parentRequestByCommentId.get(r.targetId) ?? null
          : null,
      subjectProfileId:
        r.targetType === 'user'
          ? profileIdByUserId.get(r.targetId) ?? null
          : null,
      reason: r.reason,
      details: r.details,
      reviewStatus: r.reviewStatus,
      reviewNote: r.reviewNote,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      reporter: {
        id: r.reporter.id,
        email: r.reporter.email,
        fullName: r.reporter.fullName,
      },
      targetSummary: summaries.get(`${r.targetType}:${r.targetId}`) ?? '(sin título)',
    }));

    return { reports, total };
  }

  private async buildSummaries(rows: ModerationReportOrmEntity[]): Promise<{
    summaries: Map<string, string>;
    parentRequestByCommentId: Map<string, string>;
    profileIdByUserId: Map<string, string>;
  }> {
    const out = new Map<string, string>();
    const parentRequestByCommentId = new Map<string, string>();
    const profileIdByUserId = new Map<string, string>();
    const byType = {
      service: [] as string[],
      client_request: [] as string[],
      client_request_comment: [] as string[],
      user: [] as string[],
    };
    for (const r of rows) {
      byType[r.targetType].push(r.targetId);
    }
    if (byType.service.length) {
      const ids = [...new Set(byType.service)];
      const svcs = await this.serviceRepo.find({
        where: { id: In(ids) },
        select: ['id', 'title'],
      });
      for (const s of svcs) {
        out.set(`service:${s.id}`, s.title);
      }
    }
    if (byType.client_request.length) {
      const ids = [...new Set(byType.client_request)];
      const reqs = await this.requestRepo.find({
        where: { id: In(ids) },
        select: ['id', 'title'],
      });
      for (const q of reqs) {
        out.set(`client_request:${q.id}`, q.title);
      }
    }
    if (byType.client_request_comment.length) {
      const ids = [...new Set(byType.client_request_comment)];
      const comments = await this.commentRepo.find({
        where: { id: In(ids) },
        select: ['id', 'body'],
      });
      for (const c of comments) {
        const snippet =
          c.body.length > 80 ? `${c.body.slice(0, 80)}…` : c.body;
        out.set(`client_request_comment:${c.id}`, snippet);
        parentRequestByCommentId.set(c.id, c.clientRequestId);
      }
    }
    if (byType.user.length) {
      const ids = [...new Set(byType.user)];
      const users = await this.userRepo.find({
        where: { id: In(ids) },
        select: ['id', 'email', 'fullName'],
      });
      for (const u of users) {
        const label = u.fullName?.trim() || u.email;
        out.set(`user:${u.id}`, label);
      }
      const profiles = await this.profileRepo.find({
        where: { user: { id: In(ids) } },
        relations: ['user'],
      });
      for (const p of profiles) {
        profileIdByUserId.set(p.user.id, p.id);
      }
    }
    return { summaries: out, parentRequestByCommentId, profileIdByUserId };
  }
}
