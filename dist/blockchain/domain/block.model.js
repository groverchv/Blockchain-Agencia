"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
const transaction_model_1 = require("./transaction.model");
const cryptographic_utils_1 = require("./cryptographic.utils");
class Block {
    index;
    timestamp;
    transactions;
    previousHash;
    hash;
    nonce;
    constructor(index, timestamp, transactions, previousHash = '', hash = '', nonce = 0) {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions.map((tx) => new transaction_model_1.Transaction(tx.sender, tx.recipient, tx.data, tx.timestamp, tx.signature));
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.hash = hash || this.calculateHash();
    }
    calculateHash() {
        return cryptographic_utils_1.CryptographicUtils.calculateHash(this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions.map((tx) => ({
                sender: tx.sender,
                recipient: tx.recipient,
                data: tx.data,
                timestamp: tx.timestamp,
                signature: tx.signature,
            }))) +
            this.nonce);
    }
    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join('0');
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}
exports.Block = Block;
//# sourceMappingURL=block.model.js.map