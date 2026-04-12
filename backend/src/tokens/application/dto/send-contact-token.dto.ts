import { IsUUID } from 'class-validator';

export class SendContactTokenBodyDto {
  @IsUUID('4')
  targetUserId!: string;
}
