import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRequestApplicationOrmEntity } from '../../infrastructure/persistence/entities/client-request-application.orm';
import { ClientRequestOrmEntity } from '../../infrastructure/persistence/entities/client-request.orm';
import { NotificationType } from '../../../notifications/domain/notification-type';
import { NotificationsService } from '../../../notifications/notifications.service';

export type ApplyToClientRequestResult = {
  id: string;
  requestId: string;
  applicantsCount: number;
};

@Injectable()
export class ApplyToClientRequestUseCase {
  constructor(
    @InjectRepository(ClientRequestOrmEntity)
    private readonly requestRepo: Repository<ClientRequestOrmEntity>,
    @InjectRepository(ClientRequestApplicationOrmEntity)
    private readonly applicationRepo: Repository<ClientRequestApplicationOrmEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  async execute(
    requestId: string,
    applicantUserId: string,
  ): Promise<ApplyToClientRequestResult> {
    const request = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!request || request.status !== 'OPEN') {
      throw new NotFoundException('Solicitud no encontrada o cerrada');
    }
    if (request.userId === applicantUserId) {
      throw new ForbiddenException('No puedes postular a tu propia solicitud');
    }
    const existing = await this.applicationRepo.findOne({
      where: { requestId, applicantUserId },
    });
    if (existing) {
      throw new ConflictException('Ya postulaste a esta solicitud');
    }
    const app = this.applicationRepo.create({
      requestId,
      applicantUserId,
    });
    const saved = await this.applicationRepo.save(app);
    const applicantsCount = await this.applicationRepo.count({
      where: { requestId },
    });
    await this.notifications.createForUser({
      userId: request.userId,
      type: NotificationType.ClientRequestApplication,
      title: 'Nueva postulación a tu solicitud',
      body: `Hay una nueva postulación en «${request.title}».`,
      linkPath: `/solicitar/${requestId}`,
    });
    return { id: saved.id, requestId, applicantsCount };
  }
}
