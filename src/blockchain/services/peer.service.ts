import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeerEntity } from '../persistence/entities/peer.entity';
import { LedgerService } from './ledger.service';
import { Block } from '../domain/block.model';

@Injectable()
export class PeerService {
  private readonly logger = new Logger(PeerService.name);

  constructor(
    @InjectRepository(PeerEntity)
    private readonly peerRepository: Repository<PeerEntity>,
    @Inject(forwardRef(() => LedgerService))
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * Retrieves all registered peer URLs.
   */
  async getPeers(): Promise<string[]> {
    const peers = await this.peerRepository.find();
    return peers.map((p) => p.url);
  }

  /**
   * Registers a new peer node in the database.
   */
  async registerPeer(url: string): Promise<string> {
    const cleanUrl = url.replace(/\/$/, ''); // Remove trailing slash if present
    const existing = await this.peerRepository.findOne({ where: { url: cleanUrl } });

    if (existing) {
      return cleanUrl;
    }

    const peer = new PeerEntity();
    peer.url = cleanUrl;
    await this.peerRepository.save(peer);
    this.logger.log(`Registered new peer: ${cleanUrl}`);
    return cleanUrl;
  }

  /**
   * Unregisters a peer node from the database.
   */
  async unregisterPeer(url: string): Promise<void> {
    const cleanUrl = url.replace(/\/$/, '');
    await this.peerRepository.delete({ url: cleanUrl });
    this.logger.log(`Unregistered peer: ${cleanUrl}`);
  }

  /**
   * Queries all registered peers for their blockchains and executes the consensus algorithm.
   */
  async resolveConsensus(): Promise<{ updated: boolean; length: number }> {
    const peers = await this.getPeers();
    let longestChain: Block[] | null = null;
    let maxLength = this.ledgerService.getChain().length;
    let targetPeer: string | null = null;

    for (const peer of peers) {
      try {
        const response = await fetch(`${peer}/api/blockchain`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          this.logger.warn(`Failed to fetch chain from peer ${peer}. Status: ${response.status}`);
          continue;
        }

        const peerChain: any[] = await response.json();
        
        // Convert plain JSON objects back to Block instances
        const blocks: Block[] = peerChain.map((b) => {
          return new Block(
            b.index,
            b.timestamp,
            b.transactions,
            b.previousHash,
            b.hash,
            b.nonce,
          );
        });

        if (blocks.length > maxLength && this.ledgerService.isChainValid(blocks)) {
          maxLength = blocks.length;
          longestChain = blocks;
          targetPeer = peer;
        }
      } catch (error) {
        this.logger.warn(`Peer ${peer} is unreachable: ${error.message}`);
      }
    }

    if (longestChain) {
      const success = await this.ledgerService.replaceChain(longestChain);
      if (success) {
        this.logger.log(`Successfully synchronized chain with peer ${targetPeer}. New length: ${maxLength}`);
        return { updated: true, length: maxLength };
      }
    }

    return { updated: false, length: this.ledgerService.getChain().length };
  }
}
