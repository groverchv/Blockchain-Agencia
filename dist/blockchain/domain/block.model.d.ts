import { Transaction } from './transaction.model';
export declare class Block {
    index: number;
    timestamp: number;
    transactions: Transaction[];
    previousHash: string;
    hash: string;
    nonce: number;
    constructor(index: number, timestamp: number, transactions: Transaction[], previousHash?: string, hash?: string, nonce?: number);
    calculateHash(): string;
    mineBlock(difficulty: number): void;
    hasValidTransactions(): boolean;
}
