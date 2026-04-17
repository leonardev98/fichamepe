import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ClientRequestOrmEntity } from '../client-requests/infrastructure/persistence/entities/client-request.orm';
import { ProfileOrmEntity } from '../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { ServiceOrmEntity } from '../services/infrastructure/persistence/entities/service.orm';
import { UserOrmEntity } from '../users/infrastructure/persistence/entities/user.orm-entity';
import { ChatGateway } from './chat.gateway';
import { ConversationMessageOrmEntity } from './infrastructure/persistence/entities/conversation-message.orm-entity';
import { ConversationOrmEntity } from './infrastructure/persistence/entities/conversation.orm-entity';
import type { IUserRepository } from '../users/domain/repositories';
import { USER_REPOSITORY } from '../users/users.di-tokens';
import { assertUserEmailVerified } from '../common/email-verification/assert-user-email-verified';

export type ConversationMessageApi = {
  id: string;
  senderUserId: string;
  text: string;
  createdAt: string;
};

export type ConversationThreadApi = {
  id: string;
  threadKind: 'service' | 'client_request';
  serviceId: string | null;
  clientRequestId: string | null;
  sellerUserId: string;
  buyerUserId: string;
  participant: {
    id: string;
    fullName: string;
    initials: string;
    avatarUrl: string | null;
  };
  serviceTitle: string;
  serviceCoverImageUrl: string | null;
  servicePrice: number | null;
  servicePreviousPrice: number | null;
  serviceCategory: string | null;
  serviceDeliveryTime: string | null;
  unreadCount: number;
  messages: ConversationMessageApi[];
};

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepo: Repository<ConversationOrmEntity>,
    @InjectRepository(ConversationMessageOrmEntity)
    private readonly messageRepo: Repository<ConversationMessageOrmEntity>,
    @InjectRepository(ClientRequestOrmEntity)
    private readonly clientRequestRepo: Repository<ClientRequestOrmEntity>,
    @InjectRepository(ServiceOrmEntity)
    private readonly serviceRepo: Repository<ServiceOrmEntity>,
    @InjectRepository(ProfileOrmEntity)
    private readonly profileRepo: Repository<ProfileOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    private readonly chatGateway: ChatGateway,
  ) {}

  async listThreads(userId: string): Promise<ConversationThreadApi[]> {
    const threads = await this.conversationRepo.find({
      where: [{ sellerUserId: userId }, { buyerUserId: userId }],
      order: { updatedAt: 'DESC' },
    });
    if (!threads.length) return [];
    return this.mapThreadsForUser(userId, threads);
  }

  async createOrGetThread(
    buyerUserId: string,
    serviceId: string,
  ): Promise<ConversationThreadApi> {
    const buyer = await this.users.findById(buyerUserId);
    if (!buyer) {
      throw new NotFoundException('Usuario no encontrado');
    }
    assertUserEmailVerified(buyer);
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
      relations: ['owner'],
    });
    if (!service) {
      throw new NotFoundException('Publicación no encontrada');
    }
    if (service.status !== 'ACTIVA') {
      throw new BadRequestException('La publicación no está activa.');
    }
    const sellerUserId = service.owner.id;
    if (sellerUserId === buyerUserId) {
      throw new BadRequestException('No puedes conversar contigo mismo.');
    }

    let thread = await this.conversationRepo.findOne({
      where: { serviceId, buyerUserId },
    });
    if (!thread) {
      thread = this.conversationRepo.create({
        serviceId,
        clientRequestId: null,
        sellerUserId,
        buyerUserId,
      });
      await this.conversationRepo.save(thread);
    }

    const mapped = await this.mapThreadsForUser(buyerUserId, [thread]);
    const first = mapped[0];
    if (!first) {
      throw new NotFoundException('No se pudo crear la conversación');
    }
    return first;
  }

  async createOrGetThreadForClientRequest(
    buyerUserId: string,
    clientRequestId: string,
  ): Promise<ConversationThreadApi> {
    const buyer = await this.users.findById(buyerUserId);
    if (!buyer) {
      throw new NotFoundException('Usuario no encontrado');
    }
    assertUserEmailVerified(buyer);
    const request = await this.clientRequestRepo.findOne({ where: { id: clientRequestId } });
    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }
    if (request.status !== 'OPEN') {
      throw new BadRequestException('La solicitud no está abierta.');
    }
    const sellerUserId = request.userId;
    if (sellerUserId === buyerUserId) {
      throw new BadRequestException('No puedes conversar contigo mismo.');
    }

    let thread = await this.conversationRepo.findOne({
      where: { clientRequestId, buyerUserId },
    });
    if (!thread) {
      thread = this.conversationRepo.create({
        serviceId: null,
        clientRequestId,
        sellerUserId,
        buyerUserId,
      });
      await this.conversationRepo.save(thread);
    }

    const mapped = await this.mapThreadsForUser(buyerUserId, [thread]);
    const first = mapped[0];
    if (!first) {
      throw new NotFoundException('No se pudo crear la conversación');
    }
    return first;
  }

  async createOrGetThreadUnified(
    buyerUserId: string,
    dto: { serviceId?: string; clientRequestId?: string },
  ): Promise<ConversationThreadApi> {
    const s = dto.serviceId?.trim();
    const c = dto.clientRequestId?.trim();
    if (s && c) {
      throw new BadRequestException('Envía solo serviceId o clientRequestId.');
    }
    if (!s && !c) {
      throw new BadRequestException('Debes enviar serviceId o clientRequestId.');
    }
    if (s) {
      return this.createOrGetThread(buyerUserId, s);
    }
    return this.createOrGetThreadForClientRequest(buyerUserId, c!);
  }

  async getMessageHistory(
    userId: string,
    conversationId: string,
  ): Promise<{ messages: ConversationMessageApi[] }> {
    await this.assertParticipant(userId, conversationId);
    const rows = await this.messageRepo.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
      take: 500,
    });
    return { messages: rows.map((m) => this.toMessageApi(m)) };
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    text: string,
  ): Promise<ConversationMessageApi> {
    const sender = await this.users.findById(userId);
    if (!sender) {
      throw new NotFoundException('Usuario no encontrado');
    }
    assertUserEmailVerified(sender);
    await this.assertParticipant(userId, conversationId);
    const cleaned = text.trim();
    if (!cleaned) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }
    const entity = this.messageRepo.create({
      conversation: { id: conversationId },
      senderUserId: userId,
      body: cleaned,
    });
    const saved = await this.messageRepo.save(entity);
    await this.conversationRepo.update(
      { id: conversationId },
      { updatedAt: new Date() },
    );
    const api = this.toMessageApi(saved);
    this.chatGateway.emitNewMessage(conversationId, {
      conversationId,
      ...api,
    });
    return api;
  }

  private async assertParticipant(
    userId: string,
    conversationId: string,
  ): Promise<ConversationOrmEntity> {
    const row = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!row) {
      throw new NotFoundException('Conversación no encontrada');
    }
    if (row.sellerUserId !== userId && row.buyerUserId !== userId) {
      throw new ForbiddenException('No perteneces a esta conversación');
    }
    return row;
  }

  private toMessageApi(m: ConversationMessageOrmEntity): ConversationMessageApi {
    return {
      id: m.id,
      senderUserId: m.senderUserId,
      text: m.body,
      createdAt: m.createdAt.toISOString(),
    };
  }

  private async mapThreadsForUser(
    userId: string,
    threads: ConversationOrmEntity[],
  ): Promise<ConversationThreadApi[]> {
    const serviceIds = [
      ...new Set(threads.map((t) => t.serviceId).filter((id): id is string => !!id)),
    ];
    const requestIds = [
      ...new Set(threads.map((t) => t.clientRequestId).filter((id): id is string => !!id)),
    ];
    const services =
      serviceIds.length > 0
        ? await this.serviceRepo.find({ where: { id: In(serviceIds) } })
        : [];
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    const requests =
      requestIds.length > 0
        ? await this.clientRequestRepo.find({ where: { id: In(requestIds) } })
        : [];
    const requestMap = new Map(requests.map((r) => [r.id, r]));

    const otherUserIds = threads.map((t) =>
      t.sellerUserId === userId ? t.buyerUserId : t.sellerUserId,
    );
    const uniqueOtherIds = [...new Set(otherUserIds)];
    const profiles =
      uniqueOtherIds.length > 0
        ? await this.profileRepo.find({
            where: { user: { id: In(uniqueOtherIds) } },
            relations: ['user'],
          })
        : [];
    const profileByUserId = new Map(
      profiles.map((p) => [p.user.id, p] as const),
    );

    const counterpartUsers =
      uniqueOtherIds.length > 0
        ? await this.userRepo.find({
            where: { id: In(uniqueOtherIds) },
            select: ['id', 'fullName', 'email'],
          })
        : [];
    const userById = new Map(counterpartUsers.map((u) => [u.id, u]));

    const lastByConv = await this.loadLastMessagesByThreadIds(
      threads.map((t) => t.id),
    );

    return threads.map((t) => {
      const otherId = t.sellerUserId === userId ? t.buyerUserId : t.sellerUserId;
      const profile = profileByUserId.get(otherId);
      const otherUser = userById.get(otherId);
      const display = otherUser
        ? profile
          ? this.displayName(profile, otherUser)
          : this.displayNameFromUserOnly(otherUser)
        : 'Usuario';
      const last = lastByConv.get(t.id);
      const messages: ConversationMessageApi[] = last ? [this.toMessageApi(last)] : [];

      if (t.serviceId) {
        const service = serviceMap.get(t.serviceId);
        if (!service) {
          throw new NotFoundException(`Servicio ${t.serviceId} no encontrado`);
        }
        return {
          id: t.id,
          threadKind: 'service' as const,
          serviceId: t.serviceId,
          clientRequestId: null,
          sellerUserId: t.sellerUserId,
          buyerUserId: t.buyerUserId,
          participant: {
            id: otherId,
            fullName: display,
            initials: this.initialsFromDisplay(display),
            avatarUrl: profile?.avatarUrl ?? null,
          },
          serviceTitle: service.title,
          serviceCoverImageUrl: service.coverImageUrl ?? null,
          servicePrice: service.price,
          servicePreviousPrice: service.listPrice,
          serviceCategory: service.category ?? null,
          serviceDeliveryTime: service.deliveryTime ?? null,
          unreadCount: 0,
          messages,
        };
      }

      if (t.clientRequestId) {
        const cr = requestMap.get(t.clientRequestId);
        if (!cr) {
          throw new NotFoundException('Solicitud no encontrada');
        }
        return {
          id: t.id,
          threadKind: 'client_request' as const,
          serviceId: null,
          clientRequestId: t.clientRequestId,
          sellerUserId: t.sellerUserId,
          buyerUserId: t.buyerUserId,
          participant: {
            id: otherId,
            fullName: display,
            initials: this.initialsFromDisplay(display),
            avatarUrl: profile?.avatarUrl ?? null,
          },
          serviceTitle: cr.title,
          serviceCoverImageUrl: null,
          servicePrice: null,
          servicePreviousPrice: null,
          serviceCategory: null,
          serviceDeliveryTime: null,
          unreadCount: 0,
          messages,
        };
      }

      throw new NotFoundException('Conversación inválida');
    });
  }

  private async loadLastMessagesByThreadIds(
    conversationIds: string[],
  ): Promise<Map<string, ConversationMessageOrmEntity>> {
    const map = new Map<string, ConversationMessageOrmEntity>();
    await Promise.all(
      conversationIds.map(async (id) => {
        const row = await this.messageRepo.findOne({
          where: { conversation: { id } },
          order: { createdAt: 'DESC' },
        });
        if (row) map.set(id, row);
      }),
    );
    return map;
  }

  private displayName(profile: ProfileOrmEntity, user: UserOrmEntity): string {
    const fromProfile = profile.displayName?.trim();
    if (fromProfile) return fromProfile;
    return this.displayNameFromUserOnly(user);
  }

  /** Usuario sin fila en `profile` todavía (p. ej. cuenta recién creada). */
  private displayNameFromUserOnly(user: UserOrmEntity): string {
    const fromUser = user.fullName?.trim();
    if (fromUser) return fromUser;
    const email = user.email?.split('@')[0];
    return email ?? 'Usuario';
  }

  private initialsFromDisplay(name: string): string {
    const cleaned = name.trim();
    if (!cleaned) return 'US';
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  }
}
