import { UserOrmEntity } from '../../../../users/infrastructure/persistence/entities/user.orm-entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientRequestOrmEntity } from './client-request.orm';

@Entity('client_request_comment')
@Index(['clientRequestId', 'createdAt'])
export class ClientRequestCommentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  clientRequestId: string;

  @ManyToOne(() => ClientRequestOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientRequestId' })
  clientRequest: ClientRequestOrmEntity;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'timestamptz', nullable: true })
  moderationHiddenAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
