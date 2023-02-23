import { SentryInterceptor } from './../sentry.interceptor';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { Network } from './entities/network.entity';
import { NFTDto } from 'src/nft_collection/dto/list-nft.dto';
import { JsonRpcProvider, SuiTransactionResponse } from '@mysten/sui.js';

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
    // todo
  }

  async getNftsBySuiAccount(userAddress: string): Promise<NFTDto[]> {
    const networkEnv = process.env.BLOCKCHAIN_NETWORK_ENV;
    const provider = new JsonRpcProvider(networkEnv);
    const objects = await provider.getObjectsOwnedByAddress(userAddress);
    const detailOfObjects: any = await provider.getObjectBatch(
      objects.map((x) => x.objectId),
    );
    const nftObjects = detailOfObjects.filter((x) => {
      return (
        x.status === 'Exists' &&
        x.details?.data?.fields.name !== undefined &&
        x.details?.data?.fields.url !== undefined
      );
    });
    const result = nftObjects.map((nft) => {
      return {
        name: nft.details.data.fields.name,
        description: nft.details.data.fields?.description,
        url: nft.details.data.fields.url,
        objectId: nft.details.data.fields.id.id,
        owner: nft.details.owner.AddressOwner,
        nftType: nft.details.data.type,
      };
    });
    return result;
  }

  async getNftsByUserAddress(userAddress: string): Promise<NFTDto[]> {
    const data = this.getNftsBySuiAccount(userAddress);
    return data;
  }

  async getTransactionBuyByTxHash(
    txHash: string,
  ): Promise<SuiTransactionResponse> {
    const networkEnv = process.env.BLOCKCHAIN_NETWORK_ENV;
    const provider = new JsonRpcProvider(networkEnv);
    const transaction = await provider.getTransactionWithEffects(txHash);
    return transaction;
  }
}
