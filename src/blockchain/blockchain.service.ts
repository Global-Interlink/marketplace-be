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
import { Network } from './entities/network.entity';

@UseInterceptors(SentryInterceptor)
@Injectable()
export class BlockchainService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Network)
    private networkRepository: Repository<Network>,
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
    return;
  }

  async getLatestCrawlHistory() {
    // get lastest crawl history by id and toBlockNumber not null
    return;
  }

  async verifyTransactionBuyByTxHash(txHash: string, chain: string) {
    const network = await this.getNetworkBychain(chain);
    // todo: update here. verify txn 
  }

  async crawlData(network_id: string) {
    // todo: update here. sync event to db
  }
}
