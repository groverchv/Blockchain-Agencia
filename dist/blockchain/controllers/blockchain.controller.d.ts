import { LedgerService } from '../services/ledger.service';
import { PeerService } from '../services/peer.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { RegisterPeerDto } from '../dto/register-peer.dto';
export declare class BlockchainController {
    private readonly ledgerService;
    private readonly peerService;
    constructor(ledgerService: LedgerService, peerService: PeerService);
    getBlockchain(): import("../domain/block.model").Block[];
    getPendingTransactions(): import("../domain/transaction.model").Transaction[];
    addTransaction(createTxDto: CreateTransactionDto): {
        message: string;
        transaction: import("../domain/transaction.model").Transaction;
    };
    mine(rewardAddress: string): Promise<{
        message: string;
        block: import("../domain/block.model").Block;
    }>;
    validateChain(): {
        valid: boolean;
        length: number;
        message: string;
    };
    getPeers(): Promise<{
        peers: string[];
    }>;
    registerPeer(registerPeerDto: RegisterPeerDto): Promise<{
        message: string;
        peer: string;
    }>;
    syncPeers(): Promise<{
        updated: boolean;
        currentLength: number;
        message: string;
    }>;
}
