import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/domain/services/auth-token.service.interface';
import { resolveCorsOrigin } from '../common/config/cors-origin';
import { JoinConversationSocketDto } from './application/dto/join-conversation.dto';
import { ConversationOrmEntity } from './infrastructure/persistence/entities/conversation.orm-entity';

function roomForConversation(conversationId: string): string {
  return `conv:${conversationId}`;
}

function roomForUser(userId: string): string {
  return `user:${userId}`;
}

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
@WebSocketGateway({
  cors: {
    origin: resolveCorsOrigin(),
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(ConversationOrmEntity)
    private readonly conversationRepo: Repository<ConversationOrmEntity>,
  ) {}

  handleConnection(client: Socket) {
    const token = this.extractAccessToken(client);
    if (!token) {
      this.logger.warn('Socket sin token; desconectando');
      client.disconnect(true);
      return;
    }
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (!payload?.userId) {
        client.disconnect(true);
        return;
      }
      const uid = payload.userId;
      client.data.userId = uid;
      void client.join(roomForUser(uid));
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinConversationSocketDto,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const userId = client.data.userId as string | undefined;
    if (!userId) {
      return { ok: false, error: 'unauthorized' };
    }
    const row = await this.conversationRepo.findOne({
      where: { id: body.conversationId },
      select: ['id', 'sellerUserId', 'buyerUserId'],
    });
    if (!row) {
      return { ok: false, error: 'not_found' };
    }
    if (row.sellerUserId !== userId && row.buyerUserId !== userId) {
      return { ok: false, error: 'forbidden' };
    }
    await client.join(roomForConversation(body.conversationId));
    return { ok: true };
  }

  @SubscribeMessage('leaveConversation')
  async leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinConversationSocketDto,
  ): Promise<{ ok: true }> {
    await client.leave(roomForConversation(body.conversationId));
    return { ok: true };
  }

  emitNewMessage(
    conversationId: string,
    payload: {
      conversationId: string;
      id: string;
      senderUserId: string;
      text: string;
      createdAt: string;
    },
  ): void {
    this.server.to(roomForConversation(conversationId)).emit('message:new', payload);
  }

  emitNotificationToUser(
    userId: string,
    payload: {
      id: string;
      type: string;
      title: string;
      createdAt: string;
      unreadCount: number;
    },
  ): void {
    this.server.to(roomForUser(userId)).emit('notification:new', payload);
  }

  private extractAccessToken(client: Socket): string | null {
    const fromAuth = client.handshake.auth as { token?: unknown };
    if (typeof fromAuth?.token === 'string' && fromAuth.token.length > 0) {
      return fromAuth.token;
    }
    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice('Bearer '.length).trim();
    }
    const q = client.handshake.query?.token;
    if (typeof q === 'string' && q.length > 0) return q;
    if (Array.isArray(q) && typeof q[0] === 'string') return q[0];
    return null;
  }
}
