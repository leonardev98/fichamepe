import { IsInt, IsUUID, Min } from 'class-validator';

export class GrantTokensBodyDto {
  @IsUUID('4')
  userId!: string;

  @IsInt()
  @Min(1)
  amount!: number;
}
