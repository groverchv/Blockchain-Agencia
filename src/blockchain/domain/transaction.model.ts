import { CryptographicUtils } from './cryptographic.utils';

export class Transaction {
  public sender: string; // Public key of the sender, or "SYSTEM" for mining rewards
  public recipient: string; // Public key of the recipient (e.g. candidate or system address)
  public data: any; // Context-specific payload (e.g. { jobTitle: "Node Dev", candidateId: "..." })
  public timestamp: number;
  public signature?: string;

  constructor(sender: string, recipient: string, data: any, timestamp?: number, signature?: string) {
    this.sender = sender;
    this.recipient = recipient;
    this.data = data;
    this.timestamp = timestamp || Date.now();
    this.signature = signature;
  }

  /**
   * Calculates the SHA-256 hash of the transaction content.
   */
  calculateHash(): string {
    const dataString = typeof this.data === 'string' ? this.data : JSON.stringify(this.data);
    return CryptographicUtils.calculateHash(
      this.sender + this.recipient + dataString + this.timestamp,
    );
  }

  /**
   * Verifies the cryptographic signature of the transaction.
   */
  isValid(): boolean {
    if (this.sender === 'SYSTEM') {
      return true; // System-generated mining rewards are exempt from signature checks
    }

    if (!this.signature) {
      throw new Error('No signature found in the transaction.');
    }

    const txHash = this.calculateHash();
    return CryptographicUtils.verifySignature(this.sender, txHash, this.signature);
  }
}
