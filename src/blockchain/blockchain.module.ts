import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockEntity } from './persistence/entities/block.entity';
import { PeerEntity } from './persistence/entities/peer.entity';
import { LedgerService } from './services/ledger.service';
import { PeerService } from './services/peer.service';
import { BlockchainController } from './controllers/blockchain.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlockEntity, PeerEntity]),
  ],
  controllers: [BlockchainController],
  providers: [LedgerService, PeerService],
  exports: [LedgerService, PeerService],
})
export class BlockchainModule {}
