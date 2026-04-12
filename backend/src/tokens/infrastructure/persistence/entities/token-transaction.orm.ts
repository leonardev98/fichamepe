import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserOrmEntity } from '../../../../users/infrastructure/persistence/entities/user.orm-entity';
import {
  TokenTransactionStatus,
  TokenTransactionType,
} from '../../../domain/entities/token-transaction.domain';

@Entity('token_transactions')
export class TokenTransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'fromUserId' })
  fromUser: UserOrmEntity | null;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toUserId' })
  toUser: UserOrmEntity;

  @Column({ type: 'int' })
  amount: number;

  @Column({
    type: 'varchar',
    length: 32,
  })
  type: TokenTransactionType;

  @Column({
    type: 'varchar',
    length: 32,
    default: TokenTransactionStatus.Pending,
  })
  status: TokenTransactionStatus;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'datetime', nullable: true })
  respondedAt: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
