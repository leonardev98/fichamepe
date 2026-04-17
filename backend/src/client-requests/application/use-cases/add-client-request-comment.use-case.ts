import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { assertUserEmailVerified } from '../../../common/email-verification/assert-user-email-verified';
import type { IUserRepository } from '../../../users/domain/repositories';
import { USER_REPOSITORY } from '../../../users/users.di-tokens';
import { ClientRequestCommentOrmEntity } from '../../infrastructure/persistence/entities/client-request-comment.orm';
import { ClientRequestOrmEntity } from '../../infrastructure/persistence/entities/client-request.orm';
import { NotificationType } from '../../../notifications/domain/notification-type';
import { NotificationsService } from '../../../notifications/notifications.service';

export type AddedClientRequestComment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; displayName: string; initials: string };
};

@Injectable()
export class AddClientRequestCommentUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    @InjectRepository(ClientRequestCommentOrmEntity)
    private readonly commentRepo: Repository<ClientRequestCommentOrmEntity>,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(
    requestId: string,
    authorUserId: string,
    body: string,
  ): Promise<AddedClientRequestComment> {
    const author = await this.users.findById(authorUserId);
    if (!author) {
      throw new NotFoundException('Usuario no encontrado');
    }
    assertUserEmailVerified(author);
    const req = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!req || req.status !== 'OPEN') {
      throw new NotFoundException('Solicitud no encontrada');
    }
    const cleaned = body.trim();
    if (!cleaned) {
      throw new BadRequestException('El comentario no puede estar vacío');
    }
    const row = this.commentRepo.create({
      clientRequestId: requestId,
      userId: authorUserId,
      body: cleaned,
    });
    const saved = await this.commentRepo.save(row);
    if (req.userId !== authorUserId) {
      await this.notifications.createForUser({
        userId: req.userId,
        type: NotificationType.ClientRequestComment,
        title: 'Nuevo comentario en tu solicitud',
        body: `Alguien comentó en «${req.title}».`,
        linkPath: `/solicitar/${requestId}`,
      });
    }
    const display =
      author.fullName?.trim() || author.email?.split('@')[0] || 'Usuario';
    const initials = this.initialsFromName(display);
    return {
      id: saved.id,
      body: saved.body,
      createdAt: saved.createdAt.toISOString(),
      author: {
        id: authorUserId,
        displayName: display,
        initials,
      },
    };
  }

  private initialsFromName(name: string): string {
    const p = name.trim().split(/\s+/).filter(Boolean);
    if (p.length >= 2) return `${p[0]!.slice(0, 1)}${p[1]!.slice(0, 1)}`.toUpperCase();
    return name.slice(0, 2).toUpperCase() || 'US';
  }
}
