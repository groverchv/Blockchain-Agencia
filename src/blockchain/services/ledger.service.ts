import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockEntity } from '../persistence/entities/block.entity';
import { Block } from '../domain/block.model';
import { Transaction } from '../domain/transaction.model';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LedgerService implements OnModuleInit {
  private readonly logger = new Logger(LedgerService.name);
  private pendingTransactions: Transaction[] = [];
  private chain: Block[] = [];
  private difficulty = 2; // Default difficulty (number of leading zeros)

  constructor(
    @InjectRepository(BlockEntity)
    private readonly blockRepository: Repository<BlockEntity>,
    private readonly configService: ConfigService,
  ) {
    this.difficulty = this.configService.get<number>('BLOCKCHAIN_DIFFICULTY', 2);
  }

  async onModuleInit() {
    await this.loadChainFromDatabase();
  }

  /**
   * Loads the chain from SQLite database. If empty, creates and saves the Genesis block.
   */
  private async loadChainFromDatabase() {
    try {
      const dbBlocks = await this.blockRepository.find({
        order: { index: 'ASC' },
      });

      if (dbBlocks.length === 0) {
        this.logger.log('No blocks found in database. Initializing Genesis block...');
        const genesisBlock = this.createGenesisBlock();
        await this.saveBlockToDatabase(genesisBlock);
        this.chain = [genesisBlock];
      } else {
        this.chain = dbBlocks.map((b) => {
          const txs: Transaction[] = JSON.parse(b.transactionsJson);
          return new Block(
            b.index,
            b.timestamp,
            txs,
            b.previousHash,
            b.hash,
            b.nonce,
          );
        });
        this.logger.log(`Loaded ${this.chain.length} blocks from database.`);
      }
    } catch (error) {
      this.logger.error('Failed to load blockchain from database', error.stack);
    }
  }

  private createGenesisBlock(): Block {
    const genesisTx = new Transaction('SYSTEM', 'GENESIS_WALLET', {
      message: 'Genesis Block - Agencia Blockchain network initialized.',
    });
    const block = new Block(0, 1776268800000, [genesisTx], '0'); // Hardcoded timestamp for consistency
    block.hash = block.calculateHash();
    return block;
  }

  private async saveBlockToDatabase(block: Block): Promise<void> {
    const entity = new BlockEntity();
    entity.index = block.index;
    entity.timestamp = block.timestamp;
    entity.previousHash = block.previousHash;
    entity.hash = block.hash;
    entity.nonce = block.nonce;
    entity.transactionsJson = JSON.stringify(block.transactions);
    await this.blockRepository.save(entity);
  }

  /**
   * Returns a copy of the active chain.
   */
  getChain(): Block[] {
    return this.chain;
  }

  /**
   * Returns the latest block in the chain.
   */
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Returns all pending transactions.
   */
  getPendingTransactions(): Transaction[] {
    return this.pendingTransactions;
  }

  /**
   * Adds a transaction to the pool after verifying its signature.
   */
  addTransaction(txDto: { sender: string; recipient: string; data: any; signature: string }): Transaction {
    const tx = new Transaction(txDto.sender, txDto.recipient, txDto.data, Date.now(), txDto.signature);

    if (!tx.isValid()) {
      throw new Error('Invalid transaction signature.');
    }

    this.pendingTransactions.push(tx);
    this.logger.log(`Transaction added to pool. Pool size: ${this.pendingTransactions.length}`);
    return tx;
  }

  /**
   * Mines a new block with the pending transactions.
   */
  async minePendingTransactions(miningRewardAddress: string): Promise<Block> {
    // Append mining reward transaction
    const rewardTx = new Transaction('SYSTEM', miningRewardAddress, {
      message: 'Mining Reward',
      amount: 1,
    });
    
    const blockTransactions = [...this.pendingTransactions, rewardTx];
    const latestBlock = this.getLatestBlock();
    
    const newBlock = new Block(
      latestBlock.index + 1,
      Date.now(),
      blockTransactions,
      latestBlock.hash,
    );

    this.logger.log(`Mining block ${newBlock.index} with difficulty ${this.difficulty}...`);
    const startTime = Date.now();
    newBlock.mineBlock(this.difficulty);
    const duration = (Date.now() - startTime) / 1000;
    this.logger.log(`Block ${newBlock.index} mined in ${duration}s. Hash: ${newBlock.hash}`);

    // Persist new block
    await this.saveBlockToDatabase(newBlock);
    this.chain.push(newBlock);

    // Reset pending transactions pool
    this.pendingTransactions = [];
    return newBlock;
  }

  /**
   * Checks the integrity of a given chain.
   */
  isChainValid(chainToValidate: Block[]): boolean {
    if (chainToValidate.length === 0) return false;

    // Check genesis block
    const genesis = chainToValidate[0];
    if (genesis.index !== 0 || genesis.previousHash !== '0') {
      return false;
    }

    // Validate remaining blocks
    for (let i = 1; i < chainToValidate.length; i++) {
      const currentBlock = chainToValidate[i];
      const previousBlock = chainToValidate[i - 1];

      // Re-instantiate Block to use helper methods
      const blockInstance = new Block(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.transactions,
        currentBlock.previousHash,
        currentBlock.hash,
        currentBlock.nonce,
      );

      if (currentBlock.hash !== blockInstance.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      if (!blockInstance.hasValidTransactions()) {
        return false;
      }
    }

    return true;
  }

  /**
   * Replaces the local chain with a longer, valid chain.
   */
  async replaceChain(newChain: Block[]): Promise<boolean> {
    if (newChain.length > this.chain.length && this.isChainValid(newChain)) {
      this.logger.log('Received chain is valid and longer. Replacing local chain...');
      
      // Clear database blocks and persist new chain
      await this.blockRepository.clear();
      for (const block of newChain) {
        await this.saveBlockToDatabase(block);
      }
      
      this.chain = newChain;
      return true;
    }
    return false;
  }
}
