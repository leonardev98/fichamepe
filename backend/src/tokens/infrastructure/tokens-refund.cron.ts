import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProcessContactRefundsUseCase } from '../application/use-cases/process-contact-refunds.use-case';

@Injectable()
export class TokensRefundCron {
  private readonly logger = new Logger(TokensRefundCron.name);

  constructor(private readonly processRefunds: ProcessContactRefundsUseCase) {}

  @Cron('0 * * * *')
  async handleHourly(): Promise<void> {
    const n = await this.processRefunds.execute();
    if (n > 0) {
      this.logger.log(`Reembolsos de contacto aplicados: ${n}`);
    }
  }
}
