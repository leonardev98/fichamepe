import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { NotificationTypeValue } from './domain/notification-type';
import { NotificationOrmEntity } from './infrastructure/persistence/entities/notification.orm-entity';
import { ChatGateway } from '../conversations/chat.gateway';

export type NotificationApiItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkPath: string | null;
  readAt: string | null;
  createdAt: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repo: Repository<NotificationOrmEntity>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async createForUser(input: {
    userId: string;
    type: NotificationTypeValue;
    title: string;
    body?: string | null;
    linkPath?: string | null;
  }): Promise<void> {
    const row = this.repo.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      linkPath: input.linkPath ?? null,
      readAt: null,
    });
    const saved = await this.repo.save(row);
    const unreadCount = await this.getUnreadCount(input.userId);
    this.chatGateway.emitNotificationToUser(input.userId, {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      createdAt: saved.createdAt.toISOString(),
      unreadCount,
    });
  }

  async listForUser(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ items: NotificationApiItem[]; total: number }> {
    const [rows, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    const items = rows.map((r) => this.toApi(r));
    return { items, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.count({
      where: { userId, readAt: IsNull() },
    });
  }

  private toApi(r: NotificationOrmEntity): NotificationApiItem {
    return {
      id: r.id,
      type: r.type,
      title: r.title,
      body: r.body,
      linkPath: r.linkPath,
      readAt: r.readAt ? r.readAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
    };
  }

  async markRead(userId: string, id: string): Promise<NotificationApiItem> {
    const row = await this.repo.findOne({ where: { id, userId } });
    if (!row) {
      throw new NotFoundException('Notificación no encontrada');
    }
    if (!row.readAt) {
      row.readAt = new Date();
      await this.repo.save(row);
    }
    return this.toApi(row);
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const readAt = new Date();
    const result = await this.repo
      .createQueryBuilder()
      .update(NotificationOrmEntity)
      .set({ readAt })
      .where('"userId" = :userId', { userId })
      .andWhere('"readAt" IS NULL')
      .execute();
    return { updated: result.affected ?? 0 };
  }
}
