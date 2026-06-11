import { Transaction } from './transaction.model';
import { CryptographicUtils } from './cryptographic.utils';

export class Block {
  public index: number;
  public timestamp: number;
  public transactions: Transaction[];
  public previousHash: string;
  public hash: string;
  public nonce: number;

  constructor(
    index: number,
    timestamp: number,
    transactions: Transaction[],
    previousHash = '',
    hash = '',
    nonce = 0,
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions.map(
      (tx) => new Transaction(tx.sender, tx.recipient, tx.data, tx.timestamp, tx.signature),
    );
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = hash || this.calculateHash();
  }

  /**
   * Calculates the SHA-256 hash of the block headers and transaction data.
   */
  calculateHash(): string {
    return CryptographicUtils.calculateHash(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions.map((tx) => ({
          sender: tx.sender,
          recipient: tx.recipient,
          data: tx.data,
          timestamp: tx.timestamp,
          signature: tx.signature,
        }))) +
        this.nonce,
    );
  }

  /**
   * Mines the block with a specified difficulty (number of leading zeros).
   */
  mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  /**
   * Verifies that all transactions inside the block are cryptographically valid.
   */
  hasValidTransactions(): boolean {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}
