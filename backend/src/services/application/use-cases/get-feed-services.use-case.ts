import { Inject, Injectable } from '@nestjs/common';
import type { IFindFeedServicesOptions } from '../../domain/repositories/i-service.repository';
import type { IServiceRepository } from '../../domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../services.di-tokens';
import {
  toServiceResponse,
  type ServiceResponse,
} from '../mappers/service-response.mapper';

@Injectable()
export class GetFeedServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
  ) {}

  async execute(
    query: IFindFeedServicesOptions,
  ): Promise<{ services: ServiceResponse[]; total: number }> {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 40);
    const offset = Math.max(query.offset ?? 0, 0);
    const country = query.country?.trim().toUpperCase();
    const { services, total } = await this.services.findFeedServices({
      ...query,
      limit,
      offset,
      country,
    });
    return {
      services: services.map(toServiceResponse),
      total,
    };
  }
}
