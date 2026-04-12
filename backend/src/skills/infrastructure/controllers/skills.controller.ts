import { Controller, Get, Param } from '@nestjs/common';
import { GetAllSkillsUseCase } from '../../application/use-cases/get-all-skills.use-case';
import { GetSkillsByCategoryUseCase } from '../../application/use-cases/get-skills-by-category.use-case';
import { SkillCategoryParamDto } from '../../application/dto/skill-category.param.dto';

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly getAllSkills: GetAllSkillsUseCase,
    private readonly getSkillsByCategory: GetSkillsByCategoryUseCase,
  ) {}

  @Get()
  findAll() {
    return this.getAllSkills.execute();
  }

  @Get('category/:category')
  findByCategory(@Param() params: SkillCategoryParamDto) {
    return this.getSkillsByCategory.execute(params.category);
  }
}
