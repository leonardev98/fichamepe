import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../../domain/entities/user';

@Entity('user')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string | null;

  @Column({
    type: 'varchar',
    length: 32,
    default: UserRole.Freelancer,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isPro: boolean;

  @Column({ type: 'timestamp', nullable: true })
  proExpiresAt: Date | null;

  @Column({ type: 'int', default: 0 })
  tokenBalance: number;

  @Column({ type: 'varchar', length: 16, unique: true })
  referralCode: string;

  @Column({ type: 'uuid', nullable: true })
  referredByUserId: string | null;

  @Column({ type: 'int', default: 0 })
  referralMigrationCredits: number;

  @Column({ type: 'int', default: 0 })
  referralSlotsEarned: number;

  @Column({ type: 'int', default: 0 })
  purchasedPublicationSlots: number;

  @Column({ type: 'varchar', nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerificationExpires: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerificationLastSentAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
