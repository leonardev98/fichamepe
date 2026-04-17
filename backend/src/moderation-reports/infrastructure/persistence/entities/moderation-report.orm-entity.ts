import { UserOrmEntity } from '../../../../users/infrastructure/persistence/entities/user.orm-entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export type ModerationReportReason =
  | 'fraud'
  | 'inappropriate_content'
  | 'false_information'
  | 'spam'
  | 'other';

export type ModerationTargetType =
  | 'service'
  | 'client_request'
  | 'client_request_comment'
  | 'user';

export type ModerationReviewStatus = 'pending' | 'dismissed' | 'actioned';

@Entity('moderation_report')
@Unique('UQ_moderation_report_reporter_target', ['reporter', 'targetType', 'targetId'])
@Index(['reviewStatus', 'createdAt'])
@Index(['targetType', 'targetId'])
export class ModerationReportOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32 })
  targetType: ModerationTargetType;

  @Column({ type: 'uuid' })
  targetId: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterUserId' })
  reporter: UserOrmEntity;

  @Column({ type: 'varchar', length: 40 })
  reason: ModerationReportReason;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  details: string | null;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  reviewStatus: ModerationReviewStatus;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewedByUserId' })
  reviewedBy: UserOrmEntity | null;

  @Column({ type: 'text', nullable: true })
  reviewNote: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
