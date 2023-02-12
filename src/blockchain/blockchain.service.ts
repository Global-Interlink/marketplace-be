import { SentryInterceptor } from './../sentry.interceptor';
import {
  BadRequestException,
  Injectable,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Web3 from 'web3';
import { IsNull, Not, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CrawlHistory } from './entities/crawl_history.entity';
import { Network } from './entities/network.entity';
import { Cron } from '@nestjs/schedule';
import { User } from 'src/user/entities/user.entity';
import { OrderService } from 'src/marketplace/order/order.service';
import { UserService } from 'src/user/user.service';
import { SaleItemService } from 'src/marketplace/sale_item/sale_item.service';
import { NFT } from 'src/nft_collection/entities/nft.entity';

@UseInterceptors(SentryInterceptor)
@Injectable()
export class BlockchainService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Network)
    private networkRepository: Repository<Network>,
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    @InjectRepository(CrawlHistory)
    private crawlHistoryRepository: Repository<CrawlHistory>,
    private orderService: OrderService,
    private saleItemService: SaleItemService,
  ) {}

  async getNetworkBychain(chain: string) {
    return this.networkRepository.findOne({
      where: {
        network_id: chain,
      },
    });
  }

  async createWallet(walletAddress: string, chain: string) {
    const network = await this.getNetworkBychain(chain);
    return await this.addressRepository.save({
      address: walletAddress,
      network: network,
    });
  }

  async createCrawlHistory(
    fromBlockNumber: number,
    toBlockNumber: number,
    network: Network,
  ) {
    return await this.crawlHistoryRepository.save({
      fromBlockNumber: fromBlockNumber,
      toBlockNumber: toBlockNumber,
    });
  }

  async getLatestCrawlHistory() {
    // get lastest crawl history by id and toBlockNumber not null
    return await this.crawlHistoryRepository.findOne({
      where: {
        toBlockNumber: Not(IsNull()),
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async verifyTransactionBuyByTxHash(txHash: string, chain: string) {
    const network = await this.getNetworkBychain(chain);
    // todo: update here. verify txn 
  }

  async crawlData(network_id: string) {
    // todo: update here. sync event to db
  }
}
