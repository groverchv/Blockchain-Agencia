import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BlockEntity } from '../persistence/entities/block.entity';
import { Block } from '../domain/block.model';
import { Transaction } from '../domain/transaction.model';
import { ConfigService } from '@nestjs/config';
export declare class LedgerService implements OnModuleInit {
    private readonly blockRepository;
    private readonly configService;
    private readonly logger;
    private pendingTransactions;
    private chain;
    private difficulty;
    constructor(blockRepository: Repository<BlockEntity>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private loadChainFromDatabase;
    private createGenesisBlock;
    private saveBlockToDatabase;
    getChain(): Block[];
    getLatestBlock(): Block;
    getPendingTransactions(): Transaction[];
    addTransaction(txDto: {
        sender: string;
        recipient: string;
        data: any;
        signature: string;
    }): Transaction;
    minePendingTransactions(miningRewardAddress: string): Promise<Block>;
    isChainValid(chainToValidate: Block[]): boolean;
    replaceChain(newChain: Block[]): Promise<boolean>;
}
