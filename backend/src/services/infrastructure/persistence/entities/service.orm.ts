import { ProfileOrmEntity } from '../../../../profiles/infrastructure/persistence/entities/profile.orm-entity';
import { UserOrmEntity } from '../../../../users/infrastructure/persistence/entities/user.orm-entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { ServiceStatus } from '../../../domain/entities/service.domain';

const priceNumberTransformer = {
  to: (value: number | null | undefined) => value ?? null,
  from: (value: string | null): number | null =>
    value === null || value === undefined ? null : Number(value),
};

@Entity('service')
@Index(['status'])
@Index(['viewCount'])
@Index(['createdAt'])
export class ServiceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  title: string;

  @Column({ type: 'varchar', length: 600 })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: priceNumberTransformer,
  })
  price: number | null;

  /** Precio habitual (tachado) cuando hay oferta por tiempo limitado. */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: priceNumberTransformer,
  })
  listPrice: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  promoEndsAt: Date | null;

  @Column({ type: 'varchar', length: 3, default: 'PEN' })
  currency: 'PEN';

  @Column({ type: 'varchar', nullable: true })
  coverImageUrl: string | null;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'varchar', length: 24, default: 'BORRADOR' })
  status: ServiceStatus;

  @Column({ type: 'text', nullable: true })
  moderationComment: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedByUserId: string | null;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 1,
    default: 0,
    transformer: {
      to: (value: number | null | undefined) => value ?? 0,
      from: (value: string | null): number =>
        value === null || value === undefined ? 0 : Number(value),
    },
  })
  reviewAverage: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[] | null;

  @Column({ type: 'varchar', length: 40, default: 'other' })
  category: string;

  @Column({ type: 'varchar', length: 32, default: 'digital' })
  deliveryMode: string;

  @Column({ type: 'varchar', length: 40, default: 'A coordinar' })
  deliveryTime: string;

  @Column({ type: 'varchar', length: 16, default: '0' })
  revisionsIncluded: string;

  @ManyToOne(() => ProfileOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: ProfileOrmEntity;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  owner: UserOrmEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
