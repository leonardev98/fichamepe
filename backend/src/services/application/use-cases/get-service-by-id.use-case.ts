import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IServiceRepository } from '../../domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../services.di-tokens';
import {
  toServiceResponse,
  type ServiceResponse,
} from '../mappers/service-response.mapper';

@Injectable()
export class GetServiceByIdUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
  ) {}

  async execute(id: string): Promise<ServiceResponse> {
    const found = await this.services.findActiveById(id);
    if (!found) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return toServiceResponse(found);
  }
}
