import { Controller, Get, Post, Body, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LedgerService } from '../services/ledger.service';
import { PeerService } from '../services/peer.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { RegisterPeerDto } from '../dto/register-peer.dto';

@ApiTags('Blockchain Node')
@Controller('api/blockchain')
export class BlockchainController {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly peerService: PeerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve the full blockchain ledger' })
  @ApiResponse({ status: 200, description: 'List of all mined blocks.' })
  getBlockchain() {
    return this.ledgerService.getChain();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Retrieve pending transactions in the pool' })
  @ApiResponse({ status: 200, description: 'List of pending transactions.' })
  getPendingTransactions() {
    return this.ledgerService.getPendingTransactions();
  }

  @Post('transaction')
  @ApiOperation({ summary: 'Submit a new cryptographically signed transaction' })
  @ApiResponse({ status: 201, description: 'Transaction added to the pool.' })
  @ApiResponse({ status: 400, description: 'Invalid signature or request format.' })
  addTransaction(@Body() createTxDto: CreateTransactionDto) {
    try {
      const tx = this.ledgerService.addTransaction(createTxDto);
      return {
        message: 'Transaction successfully validated and added to pool.',
        transaction: tx,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('mine')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mine pending transactions into a new block' })
  @ApiResponse({ status: 200, description: 'Successfully mined a new block.' })
  async mine(@Body('rewardAddress') rewardAddress: string) {
    const address = rewardAddress || 'GENERIC_MINER_WALLET';
    try {
      const newBlock = await this.ledgerService.minePendingTransactions(address);
      return {
        message: 'Block successfully mined and added to the chain.',
        block: newBlock,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('validate')
  @ApiOperation({ summary: 'Verify integrity of the local chain' })
  @ApiResponse({ status: 200, description: 'Validation result.' })
  validateChain() {
    const chain = this.ledgerService.getChain();
    const isValid = this.ledgerService.isChainValid(chain);
    return {
      valid: isValid,
      length: chain.length,
      message: isValid ? 'Blockchain is intact.' : 'Warning: Blockchain integrity compromised!',
    };
  }

  @Get('peers')
  @ApiOperation({ summary: 'List all registered peer nodes' })
  @ApiResponse({ status: 200, description: 'List of peer URLs.' })
  async getPeers() {
    const peers = await this.peerService.getPeers();
    return { peers };
  }

  @Post('peers')
  @ApiOperation({ summary: 'Register a new peer node' })
  @ApiResponse({ status: 201, description: 'Peer successfully registered.' })
  async registerPeer(@Body() registerPeerDto: RegisterPeerDto) {
    const url = await this.peerService.registerPeer(registerPeerDto.url);
    return {
      message: 'Peer registered successfully.',
      peer: url,
    };
  }

  @Post('peers/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger consensus and sync chain with peers (longest chain rule)' })
  @ApiResponse({ status: 200, description: 'Consensus sync outcome.' })
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
}
