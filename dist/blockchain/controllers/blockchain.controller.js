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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ledger_service_1 = require("../services/ledger.service");
const peer_service_1 = require("../services/peer.service");
const create_transaction_dto_1 = require("../dto/create-transaction.dto");
const register_peer_dto_1 = require("../dto/register-peer.dto");
let BlockchainController = class BlockchainController {
    ledgerService;
    peerService;
    constructor(ledgerService, peerService) {
        this.ledgerService = ledgerService;
        this.peerService = peerService;
    }
    getBlockchain() {
        return this.ledgerService.getChain();
    }
    getPendingTransactions() {
        return this.ledgerService.getPendingTransactions();
    }
    addTransaction(createTxDto) {
        try {
            const tx = this.ledgerService.addTransaction(createTxDto);
            return {
                message: 'Transaction successfully validated and added to pool.',
                transaction: tx,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async mine(rewardAddress) {
        const address = rewardAddress || 'GENERIC_MINER_WALLET';
        try {
            const newBlock = await this.ledgerService.minePendingTransactions(address);
            return {
                message: 'Block successfully mined and added to the chain.',
                block: newBlock,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    validateChain() {
        const chain = this.ledgerService.getChain();
        const isValid = this.ledgerService.isChainValid(chain);
        return {
            valid: isValid,
            length: chain.length,
            message: isValid ? 'Blockchain is intact.' : 'Warning: Blockchain integrity compromised!',
        };
    }
    async getPeers() {
        const peers = await this.peerService.getPeers();
        return { peers };
    }
    async registerPeer(registerPeerDto) {
        const url = await this.peerService.registerPeer(registerPeerDto.url);
        return {
            message: 'Peer registered successfully.',
            peer: url,
        };
    }
    async syncPeers() {
        const result = await this.peerService.resolveConsensus();
        return {
            updated: result.updated,
            currentLength: result.length,
            message: result.updated
                ? 'Local chain was updated to match the longest valid peer chain.'
                : 'Local chain is already up to date with all reachable peers.',
        };
    }
};
exports.BlockchainController = BlockchainController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve the full blockchain ledger' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all mined blocks.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlockchainController.prototype, "getBlockchain", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve pending transactions in the pool' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of pending transactions.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlockchainController.prototype, "getPendingTransactions", null);
__decorate([
    (0, common_1.Post)('transaction'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a new cryptographically signed transaction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction added to the pool.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid signature or request format.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], BlockchainController.prototype, "addTransaction", null);
__decorate([
    (0, common_1.Post)('mine'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mine pending transactions into a new block' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully mined a new block.' }),
    __param(0, (0, common_1.Body)('rewardAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify integrity of the local chain' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Validation result.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BlockchainController.prototype, "validateChain", null);
__decorate([
    (0, common_1.Get)('peers'),
    (0, swagger_1.ApiOperation)({ summary: 'List all registered peer nodes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of peer URLs.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getPeers", null);
__decorate([
    (0, common_1.Post)('peers'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new peer node' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Peer successfully registered.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_peer_dto_1.RegisterPeerDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "registerPeer", null);
__decorate([
    (0, common_1.Post)('peers/sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger consensus and sync chain with peers (longest chain rule)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consensus sync outcome.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "syncPeers", null);
exports.BlockchainController = BlockchainController = __decorate([
    (0, swagger_1.ApiTags)('Blockchain Node'),
    (0, common_1.Controller)('api/blockchain'),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService,
        peer_service_1.PeerService])
], BlockchainController);
//# sourceMappingURL=blockchain.controller.js.map