"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const block_entity_1 = require("../persistence/entities/block.entity");
const block_model_1 = require("../domain/block.model");
const transaction_model_1 = require("../domain/transaction.model");
const config_1 = require("@nestjs/config");
let LedgerService = LedgerService_1 = class LedgerService {
    blockRepository;
    configService;
    logger = new common_1.Logger(LedgerService_1.name);
    pendingTransactions = [];
    chain = [];
    difficulty = 2;
    constructor(blockRepository, configService) {
        this.blockRepository = blockRepository;
        this.configService = configService;
        this.difficulty = this.configService.get('BLOCKCHAIN_DIFFICULTY', 2);
    }
    async onModuleInit() {
        await this.loadChainFromDatabase();
    }
    async loadChainFromDatabase() {
        try {
            const dbBlocks = await this.blockRepository.find({
                order: { index: 'ASC' },
            });
            if (dbBlocks.length === 0) {
                this.logger.log('No blocks found in database. Initializing Genesis block...');
                const genesisBlock = this.createGenesisBlock();
                await this.saveBlockToDatabase(genesisBlock);
                this.chain = [genesisBlock];
            }
            else {
                this.chain = dbBlocks.map((b) => {
                    const txs = JSON.parse(b.transactionsJson);
                    return new block_model_1.Block(b.index, b.timestamp, txs, b.previousHash, b.hash, b.nonce);
                });
                this.logger.log(`Loaded ${this.chain.length} blocks from database.`);
            }
        }
        catch (error) {
            this.logger.error('Failed to load blockchain from database', error.stack);
        }
    }
    createGenesisBlock() {
        const genesisTx = new transaction_model_1.Transaction('SYSTEM', 'GENESIS_WALLET', {
            message: 'Genesis Block - Agencia Blockchain network initialized.',
        });
        const block = new block_model_1.Block(0, 1776268800000, [genesisTx], '0');
        block.hash = block.calculateHash();
        return block;
    }
    async saveBlockToDatabase(block) {
        const entity = new block_entity_1.BlockEntity();
        entity.index = block.index;
        entity.timestamp = block.timestamp;
        entity.previousHash = block.previousHash;
        entity.hash = block.hash;
        entity.nonce = block.nonce;
        entity.transactionsJson = JSON.stringify(block.transactions);
        await this.blockRepository.save(entity);
    }
    getChain() {
        return this.chain;
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    getPendingTransactions() {
        return this.pendingTransactions;
    }
    addTransaction(txDto) {
        const tx = new transaction_model_1.Transaction(txDto.sender, txDto.recipient, txDto.data, Date.now(), txDto.signature);
        if (!tx.isValid()) {
            throw new Error('Invalid transaction signature.');
        }
        this.pendingTransactions.push(tx);
        this.logger.log(`Transaction added to pool. Pool size: ${this.pendingTransactions.length}`);
        return tx;
    }
    async minePendingTransactions(miningRewardAddress) {
        const rewardTx = new transaction_model_1.Transaction('SYSTEM', miningRewardAddress, {
            message: 'Mining Reward',
            amount: 1,
        });
        const blockTransactions = [...this.pendingTransactions, rewardTx];
        const latestBlock = this.getLatestBlock();
        const newBlock = new block_model_1.Block(latestBlock.index + 1, Date.now(), blockTransactions, latestBlock.hash);
        this.logger.log(`Mining block ${newBlock.index} with difficulty ${this.difficulty}...`);
        const startTime = Date.now();
        newBlock.mineBlock(this.difficulty);
        const duration = (Date.now() - startTime) / 1000;
        this.logger.log(`Block ${newBlock.index} mined in ${duration}s. Hash: ${newBlock.hash}`);
        await this.saveBlockToDatabase(newBlock);
        this.chain.push(newBlock);
        this.pendingTransactions = [];
        return newBlock;
    }
    isChainValid(chainToValidate) {
        if (chainToValidate.length === 0)
            return false;
        const genesis = chainToValidate[0];
        if (genesis.index !== 0 || genesis.previousHash !== '0') {
            return false;
        }
        for (let i = 1; i < chainToValidate.length; i++) {
            const currentBlock = chainToValidate[i];
            const previousBlock = chainToValidate[i - 1];
            const blockInstance = new block_model_1.Block(currentBlock.index, currentBlock.timestamp, currentBlock.transactions, currentBlock.previousHash, currentBlock.hash, currentBlock.nonce);
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
    async replaceChain(newChain) {
        if (newChain.length > this.chain.length && this.isChainValid(newChain)) {
            this.logger.log('Received chain is valid and longer. Replacing local chain...');
            await this.blockRepository.clear();
            for (const block of newChain) {
                await this.saveBlockToDatabase(block);
            }
            this.chain = newChain;
            return true;
        }
        return false;
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = LedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(block_entity_1.BlockEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map