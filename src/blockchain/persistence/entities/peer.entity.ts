import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('peers')
export class PeerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  url: string; // Peer base URL, e.g. "http://blockchain-node-2:3000"
}
