import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import type { IServiceRepository } from '../../../services/domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../../services/services.di-tokens';
import { ServiceOrmEntity } from '../../../services/infrastructure/persistence/entities/service.orm';
import { ProfileOrmEntity } from '../../../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { ConversationOrmEntity } from '../../../conversations/infrastructure/persistence/entities/conversation.orm-entity';
import { ServiceReviewOrmEntity } from '../../infrastructure/persistence/entities/service-review.orm-entity';
import type { CreateServiceReviewBodyDto } from '../dto/create-service-review.dto';
import {
  serviceReviewToPublicDto,
  type ServiceReviewPublicDto,
} from '../mappers/service-review-public.mapper';
import { NotificationType } from '../../../notifications/domain/notification-type';
import { NotificationsService } from '../../../notifications/notifications.service';

function isUniqueViolation(err: unknown): boolean {
  if (!(err instanceof QueryFailedError)) {
    return false;
  }
  const d = err.driverError as { code?: string | number; errno?: number };
  return (
    d?.code === '23505' ||
    d?.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
    d?.errno === 19
  );
}

@Injectable()
export class CreateServiceReviewUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
    private readonly dataSource: DataSource,
    @InjectRepository(ConversationOrmEntity)
    private readonly conversations: Repository<ConversationOrmEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(
    serviceId: string,
    authorUserId: string,
    dto: CreateServiceReviewBodyDto,
  ): Promise<ServiceReviewPublicDto> {
    const service = await this.services.findActiveById(serviceId);
    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }
    if (service.userId === authorUserId) {
      throw new ForbiddenException('No puedes reseñar tu propia publicación');
    }

    const convCount = await this.conversations.count({
      where: {
        serviceId,
        buyerUserId: authorUserId,
        sellerUserId: service.userId,
      },
    });
    const isVerifiedPurchase = convCount > 0;

    try {
      const out = await this.dataSource.transaction(async (manager) => {
        const reviewRepo = manager.getRepository(ServiceReviewOrmEntity);
        const serviceRepo = manager.getRepository(ServiceOrmEntity);

        const row = reviewRepo.create({
          service: { id: serviceId } as ServiceOrmEntity,
          author: { id: authorUserId },
          rating: dto.rating,
          body: dto.body.trim(),
          isVerifiedPurchase,
        });
        const saved = await reviewRepo.save(row);

        const stats = await reviewRepo
          .createQueryBuilder('rv')
          .select('COUNT(*)', 'cnt')
          .addSelect('AVG(rv.rating)', 'avg')
          .where('rv.serviceId = :id', { id: serviceId })
          .getRawOne<{ cnt: string; avg: string | null }>();

        const reviewCount = parseInt(stats?.cnt ?? '0', 10);
        const avgNum =
          stats?.avg === null ||
          stats?.avg === undefined ||
          stats?.avg === ''
            ? 0
            : Number(stats.avg);
        const reviewAverage =
          reviewCount === 0 ? 0 : Math.round(avgNum * 10) / 10;

        await serviceRepo.update(serviceId, { reviewCount, reviewAverage });

        const reloaded = await reviewRepo.findOne({
          where: { id: saved.id },
          relations: ['author'],
        });
        if (!reloaded) {
          throw new NotFoundException('Reseña no encontrada tras crear');
        }

        const profile = await manager.getRepository(ProfileOrmEntity).findOne({
          where: { user: { id: authorUserId } },
          relations: ['user'],
        });

        return serviceReviewToPublicDto(
          reloaded,
          profile ?? undefined,
          serviceId,
          service.title,
        );
      });
      await this.notifications.createForUser({
        userId: service.userId,
        type: NotificationType.ServiceReviewReceived,
        title: 'Nueva reseña en tu publicación',
        body: `${dto.rating} estrellas en «${service.title}».`,
        linkPath: `/servicios/${serviceId}`,
      });
      return out;
    } catch (e) {
      if (isUniqueViolation(e)) {
        throw new ConflictException('Ya publicaste una reseña en este servicio');
      }
      throw e;
    }
  }
}
