import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SeedSkillsUseCase } from '../application/use-cases/seed-skills.use-case';

@Injectable()
export class SkillsSeedRunner implements OnModuleInit {
  private readonly logger = new Logger(SkillsSeedRunner.name);

  constructor(private readonly seedSkills: SeedSkillsUseCase) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.seedSkills.execute();
    } catch (e) {
      this.logger.warn(`Seed skills omitido o fallido: ${String(e)}`);
    }
  }
}
