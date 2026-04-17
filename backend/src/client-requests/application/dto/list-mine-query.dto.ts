import { IsIn, IsOptional, IsString } from 'class-validator';

const MINE_STATUSES = [
  'EN_REVISION',
  'OPEN',
  'REQUIERE_CAMBIOS',
  'OCULTA',
  'all',
] as const;

export class ListMineClientRequestsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(MINE_STATUSES)
  status?: (typeof MINE_STATUSES)[number];
}
