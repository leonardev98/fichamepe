import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { SubscriptionPlan } from '../../domain/entities/subscription.domain';

export class CreatePendingSubscriptionBodyDto {
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
