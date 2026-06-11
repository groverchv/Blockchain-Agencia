import { Repository } from 'typeorm';
import { PeerEntity } from '../persistence/entities/peer.entity';
import { LedgerService } from './ledger.service';
export declare class PeerService {
    private readonly peerRepository;
    private readonly ledgerService;
    private readonly logger;
    constructor(peerRepository: Repository<PeerEntity>, ledgerService: LedgerService);
    getPeers(): Promise<string[]>;
    registerPeer(url: string): Promise<string>;
    unregisterPeer(url: string): Promise<void>;
    resolveConsensus(): Promise<{
        updated: boolean;
        length: number;
    }>;
}
