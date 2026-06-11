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
var PeerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const peer_entity_1 = require("../persistence/entities/peer.entity");
const ledger_service_1 = require("./ledger.service");
const block_model_1 = require("../domain/block.model");
let PeerService = PeerService_1 = class PeerService {
    peerRepository;
    ledgerService;
    logger = new common_1.Logger(PeerService_1.name);
    constructor(peerRepository, ledgerService) {
        this.peerRepository = peerRepository;
        this.ledgerService = ledgerService;
    }
    async getPeers() {
        const peers = await this.peerRepository.find();
        return peers.map((p) => p.url);
    }
    async registerPeer(url) {
        const cleanUrl = url.replace(/\/$/, '');
        const existing = await this.peerRepository.findOne({ where: { url: cleanUrl } });
        if (existing) {
            return cleanUrl;
        }
        const peer = new peer_entity_1.PeerEntity();
        peer.url = cleanUrl;
        await this.peerRepository.save(peer);
        this.logger.log(`Registered new peer: ${cleanUrl}`);
        return cleanUrl;
    }
    async unregisterPeer(url) {
        const cleanUrl = url.replace(/\/$/, '');
        await this.peerRepository.delete({ url: cleanUrl });
        this.logger.log(`Unregistered peer: ${cleanUrl}`);
    }
    async resolveConsensus() {
        const peers = await this.getPeers();
        let longestChain = null;
        let maxLength = this.ledgerService.getChain().length;
        let targetPeer = null;
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
                const peerChain = await response.json();
                const blocks = peerChain.map((b) => {
                    return new block_model_1.Block(b.index, b.timestamp, b.transactions, b.previousHash, b.hash, b.nonce);
                });
                if (blocks.length > maxLength && this.ledgerService.isChainValid(blocks)) {
                    maxLength = blocks.length;
                    longestChain = blocks;
                    targetPeer = peer;
                }
            }
            catch (error) {
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
};
exports.PeerService = PeerService;
exports.PeerService = PeerService = PeerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(peer_entity_1.PeerEntity)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => ledger_service_1.LedgerService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ledger_service_1.LedgerService])
], PeerService);
//# sourceMappingURL=peer.service.js.map