import { IsIn, IsString } from 'class-validator';
import { SKILL_CATEGORIES } from '../constants/predefined-skills';

export class SkillCategoryParamDto {
  @IsString()
  @IsIn(SKILL_CATEGORIES, {
    message: `category debe ser una de: ${SKILL_CATEGORIES.join(', ')}`,
  })
  category!: string;
}
