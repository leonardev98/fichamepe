import type { SkillSeedItem } from '../../domain/repositories/i-skill.repository';

export const PREDEFINED_SKILLS_BY_CATEGORY: Record<string, readonly string[]> =
  {
    programacion: [
      'Desarrollo web',
      'React',
      'Node.js',
      'Python',
      'Flutter',
      'NestJS',
      'PostgreSQL',
    ],
    diseno: [
      'Diseño gráfico',
      'UI/UX',
      'Figma',
      'Illustrator',
      'Photoshop',
      'Canva',
      'Video editing',
    ],
    marketing: [
      'Marketing digital',
      'SEO',
      'Redes sociales',
      'Email marketing',
      'Google Ads',
    ],
    idiomas: ['Inglés', 'Portugués', 'Francés', 'Alemán', 'Chino mandarín'],
    otros: [
      'Fotografía',
      'Redacción',
      'Traducción',
      'Clases particulares',
      'Música',
    ],
  };

export const SKILL_CATEGORIES = Object.keys(PREDEFINED_SKILLS_BY_CATEGORY);

export function flatPredefinedSkillSeeds(): SkillSeedItem[] {
  return Object.entries(PREDEFINED_SKILLS_BY_CATEGORY).flatMap(
    ([category, names]) => names.map((name) => ({ name, category })),
  );
}
