export declare class Transaction {
    sender: string;
    recipient: string;
    data: any;
    timestamp: number;
    signature?: string;
    constructor(sender: string, recipient: string, data: any, timestamp?: number, signature?: string);
    calculateHash(): string;
    isValid(): boolean;
}
