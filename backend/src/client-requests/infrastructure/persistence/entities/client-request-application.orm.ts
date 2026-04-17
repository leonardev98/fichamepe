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
} from 'typeorm';
import { ClientRequestOrmEntity } from './client-request.orm';

@Entity('client_request_application')
@Unique(['requestId', 'applicantUserId'])
@Index(['requestId'])
export class ClientRequestApplicationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  requestId: string;

  @ManyToOne(() => ClientRequestOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: ClientRequestOrmEntity;

  @Column({ type: 'uuid' })
  applicantUserId: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicantUserId' })
  applicant: UserOrmEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
