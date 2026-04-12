import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../../../users/infrastructure/persistence/entities/user.orm-entity';
import { SkillOrmEntity } from '../../../../skills/infrastructure/persistence/entities/skill.orm';

@Entity('profiles')
export class ProfileOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  district: string | null;

  @Column({ type: 'varchar', nullable: true })
  whatsappNumber: string | null;

  @Column({ type: 'simple-array', nullable: true })
  portfolioImages: string[] | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: string | null;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @OneToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  @ManyToMany(() => SkillOrmEntity)
  @JoinTable({
    name: 'profile_skills',
    joinColumn: { name: 'profileId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
  })
  skills: SkillOrmEntity[];
}
