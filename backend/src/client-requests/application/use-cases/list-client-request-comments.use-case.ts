import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { ClientRequestCommentOrmEntity } from '../../infrastructure/persistence/entities/client-request-comment.orm';
import { ClientRequestOrmEntity } from '../../infrastructure/persistence/entities/client-request.orm';
import { ProfileOrmEntity } from '../../../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { UserOrmEntity } from '../../../users/infrastructure/persistence/entities/user.orm-entity';

export type ClientRequestCommentPublic = {
  id: string;
  body: string;
  createdAt: Date;
  author: {
    id: string;
    displayName: string;
    initials: string;
  };
};

@Injectable()
export class ListClientRequestCommentsUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    @InjectRepository(ClientRequestCommentOrmEntity)
    private readonly commentRepo: Repository<ClientRequestCommentOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(ProfileOrmEntity)
    private readonly profileRepo: Repository<ProfileOrmEntity>,
  ) {}

  async execute(
    requestId: string,
    limit: number,
    offset: number,
  ): Promise<{ comments: ClientRequestCommentPublic[]; total: number }> {
    const req = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!req || req.status !== 'OPEN') {
      throw new NotFoundException('Solicitud no encontrada');
    }
    const take = Math.min(100, Math.max(1, limit));
    const skip = Math.max(0, offset);
    const [rows, total] = await this.commentRepo.findAndCount({
      where: { clientRequestId: requestId, moderationHiddenAt: IsNull() },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
    const userIds = [...new Set(rows.map((r) => r.userId))];
    const users =
      userIds.length > 0
        ? await this.userRepo.find({
            where: { id: In(userIds) },
            select: ['id', 'fullName', 'email'],
          })
        : [];
    const profiles =
      userIds.length > 0
        ? await this.profileRepo.find({
            where: { user: { id: In(userIds) } },
            relations: ['user'],
          })
        : [];
    const profileByUser = new Map(profiles.map((p) => [p.user.id, p]));
    const userById = new Map(users.map((u) => [u.id, u]));

    const comments: ClientRequestCommentPublic[] = rows.map((c) => {
      const profile = profileByUser.get(c.userId);
      const user = userById.get(c.userId);
      const display =
        profile?.displayName?.trim() ||
        user?.fullName?.trim() ||
        user?.email?.split('@')[0] ||
        'Usuario';
      const initials = this.initials(display);
      return {
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        author: { id: c.userId, displayName: display, initials },
      };
    });
    return { comments, total };
  }

  private initials(name: string): string {
    const p = name.trim().split(/\s+/).filter(Boolean);
    if (p.length >= 2) return `${p[0]!.slice(0, 1)}${p[1]!.slice(0, 1)}`.toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'US';
  }
}
