import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('blocks')
export class BlockEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  index: number;

  @Column({ type: 'integer' })
  timestamp: number;

  @Column()
  previousHash: string;

  @Column()
  hash: string;

  @Column({ type: 'integer' })
  nonce: number;

  @Column({ type: 'text' })
  transactionsJson: string; // Serialized Transaction[]
}
