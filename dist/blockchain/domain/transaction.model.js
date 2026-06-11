"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const cryptographic_utils_1 = require("./cryptographic.utils");
class Transaction {
    sender;
    recipient;
    data;
    timestamp;
    signature;
    constructor(sender, recipient, data, timestamp, signature) {
        this.sender = sender;
        this.recipient = recipient;
        this.data = data;
        this.timestamp = timestamp || Date.now();
        this.signature = signature;
    }
    calculateHash() {
        const dataString = typeof this.data === 'string' ? this.data : JSON.stringify(this.data);
        return cryptographic_utils_1.CryptographicUtils.calculateHash(this.sender + this.recipient + dataString + this.timestamp);
    }
    isValid() {
        if (this.sender === 'SYSTEM') {
            return true;
        }
        if (!this.signature) {
            throw new Error('No signature found in the transaction.');
        }
        const txHash = this.calculateHash();
        return cryptographic_utils_1.CryptographicUtils.verifySignature(this.sender, txHash, this.signature);
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.model.js.map