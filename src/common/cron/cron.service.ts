import { SentryInterceptor } from './../../sentry.interceptor';
import { Web3Provider } from '@ethersproject/providers';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ethers, Wallet } from 'ethers';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { SaleItemService } from 'src/marketplace/sale_item/sale_item.service';
import OnusExchange from '../../blockchain/abi/OnusExchange.json';
import Web3 from 'web3';
import { SaleItemState } from 'src/marketplace/sale_item/sale_item.constants';
import { OrderService } from 'src/marketplace/order/order.service';
import { Express } from '@sentry/tracing/types/integrations';
import { NFTState } from 'src/nft_collection/constants/nft.constants';

@UseInterceptors(SentryInterceptor)
@Injectable()
export class CronService {
  constructor(
    private blockchainService: BlockchainService,
    private saleItemService: SaleItemService,
    private orderService: OrderService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async crawlAuctionExpired() {
    // todo: cron auctions has expired
  }

  @UseInterceptors(SentryInterceptor)
  @Cron(CronExpression.EVERY_30_SECONDS)
  async crawlDataOnBlockchain() {
    const data = await this.blockchainService.crawlData('bsc_testnet'); //todo-quang: hardcode
    return;
  }

  async getSignatureFromString(signature: string) {
    const singed = signature.substring(2);
    const r = '0x' + singed.substring(0, 64);
    const s = '0x' + singed.substring(64, 128);
    const v = parseInt(singed.substring(128, 130), 16);
    return { v, r, s };
  }
}
