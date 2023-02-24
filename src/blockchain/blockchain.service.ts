import { SentryInterceptor } from './../sentry.interceptor';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { Network } from './entities/network.entity';
import { NFTDto } from 'src/nft_collection/dto/list-nft.dto';
import { JsonRpcProvider, SuiTransactionResponse } from '@mysten/sui.js';
import { EventLog } from './entities/event.entity';

@UseInterceptors(SentryInterceptor)
@Injectable()
export class BlockchainService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Network)
    private networkRepository: Repository<Network>,
    @InjectRepository(EventLog)
    private eventLogRepository: Repository<EventLog>,
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

  async getNewEventsInModule() {
    const lastEventLog = await this.eventLogRepository.findOne({
      where: {},
      order: {
        "timestamp": "DESC"
      },
    });
    let eventCursor = null;
    if (lastEventLog) {
      eventCursor = JSON.parse(lastEventLog.eventId);
    }
    console.log(eventCursor);
    const networkEnv = process.env.BLOCKCHAIN_NETWORK_ENV;
    const provider = new JsonRpcProvider(networkEnv);
    const eventQuery = {
      MoveModule: {
          package: process.env.PACKAGE_OBJECT_ID,
          module: "marketplace"
      }
    };

    let newEvents = [];
    const events = await provider.getEvents(eventQuery, eventCursor, null, 'ascending');
    console.log(`Fetched ${events.data.length} events`)
    for (let i = 0; i < events["data"].length; i++) {
      const eventData = events["data"][i];
      const isNew = await this.createEventLogFromEventData(eventData);
      if (isNew) {
        newEvents.push(eventData);
      }
    }

    return newEvents;
  }

  async createEventLogFromEventData(eventData: any) {
    const eventId = JSON.stringify(eventData.id);
    const existing_event = await this.eventLogRepository.findOne({
      where: {
        eventId: eventId
      }
    });
    if (!existing_event) {
      console.log("Creating event: ", eventId)
      const eventLog = new EventLog();
      eventLog.transactionId = eventData.txDigest;
      eventLog.eventId = eventId;
      eventLog.timestamp = eventData.timestamp;
      eventLog.rawData = JSON.stringify(eventData);
      eventLog.save();

      return true;
    }
    return false;
  }
}
