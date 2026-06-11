import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainModule } from './blockchain/blockchain.module';
import { BlockEntity } from './blockchain/persistence/entities/block.entity';
import { PeerEntity } from './blockchain/persistence/entities/peer.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): any => ({
        type: 'better-sqlite3',
        database: configService.get<string>('DATABASE_FILE', 'blockchain.db'),
        entities: [BlockEntity, PeerEntity],
        synchronize: true, // Auto-create tables in development/local
      }),
    }),
    BlockchainModule,
  ],
})
export class AppModule {}
