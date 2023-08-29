import {
  Body,
  Controller,
  forwardRef,
  Inject,
  Post,
  Get,
} from '@nestjs/common';
import { OrderService } from 'src/marketplace/order/order.service';
import { NftService } from 'src/nft_collection/resources/nft/nft.service';
import { UserService } from 'src/user/user.service';
import { BlockchainService } from './blockchain.service';
import { SignAdminDTO } from './dto/sign-admin-dto';
import { VerifyTransactionDTO } from './dto/verifytransaction-dto';

@Controller('/api/v1/blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('crawl')
  async test() {
    await this.blockchainService.crawlData('bsc_testnet');
  }

  @Post('verify-transaction')
  async verifyTransaction(@Body() verifyTransaction: VerifyTransactionDTO) {
    const data = await this.blockchainService.verifyTransactionBuyByTxHash(
      verifyTransaction.txHash,
      verifyTransaction.chain,
    );
    return data;
  }
  @Get('statistic')
  async getStatisticData() {
    const data = await this.blockchainService.getStatisticData();
    return data;
  }
}
