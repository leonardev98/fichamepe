import { Inject, Injectable } from '@nestjs/common';
import type { IServiceRepository } from '../../domain/repositories/i-service.repository';
import { SERVICE_REPOSITORY } from '../../services.di-tokens';
import { IncrementViewUseCase } from './increment-view.use-case';

@Injectable()
export class RecordServiceViewUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: IServiceRepository,
    private readonly incrementView: IncrementViewUseCase,
  ) {}

  /** Solo servicios ACTIVA; false si no existe o no es público. */
  async execute(id: string): Promise<boolean> {
    const active = await this.services.findActiveById(id);
    if (!active) {
      return false;
    }
    await this.incrementView.execute(id);
    return true;
  }
}
