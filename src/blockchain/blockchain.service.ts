import { SentryInterceptor } from './../sentry.interceptor';
import { Injectable, UnprocessableEntityException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { Network } from './entities/network.entity';
import { NFTDto } from 'src/nft_collection/dto/list-nft.dto';
import { ObjectId, SuiTransactionBlockResponse } from '@mysten/sui.js';
import { EventLog } from './entities/event.entity';
import { getRPCConnection } from "../../src/utils/common";

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
    const provider = getRPCConnection();
    const objects = await provider.getOwnedObjects({ owner: userAddress });
    const detailOfObjects: any = await provider.multiGetObjects({ ids: objects.data.map((x) => x.data?.objectId), options: {
      showType: true,
      showContent: true,
      showOwner: true,
      showPreviousTransaction: true,
      showStorageRebate: true,
      showDisplay: true,
    } });
    const nftObjects = detailOfObjects.filter((x) => {
      return (
        x.data?.content?.fields.name !== undefined &&
        (x.data?.content?.fields.img_url !== undefined || x.data?.content?.fields.url !== undefined)
      );
    });
    const result = nftObjects.map((nft) => {
      return {
        name: nft.data.content.fields.name,
        description: nft.data.content.fields?.description,
        url: nft.data.content.fields.url || nft.data.content.fields.img_url,
        objectId: nft.data.content.fields.id.id,
        owner: nft.data.owner.AddressOwner,
        nftType: nft.data.type,
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
    retries = 3 
  ): Promise<SuiTransactionBlockResponse> {
    const provider = getRPCConnection();
    try {
      const transaction = await provider.getTransactionBlock({ digest: txHash, options: { showEffects: true, showEvents: true } });
      return transaction;
    } catch(err) {
      if (retries > 0) {
        this.delay(1000);
        return this.getTransactionBuyByTxHash(txHash, retries - 1);
      } else
        throw new UnprocessableEntityException('Transaction not found!');
    }
  }

  async getEventByEventDigest(
    eventsDigest: string
  ) {
    const provider = getRPCConnection();
    const eventQuery = {
      Transaction: eventsDigest
    };
    const event = await provider.queryEvents({ query: eventQuery });
    return event;
  }


  async getNewEventsInModule() {
    const lastEventLog = await this.eventLogRepository.findOne({
      where: {},
      order: {
        "timestamp": "DESC",
        "id": "DESC"
      },
    });
    let eventCursor = null;
    if (lastEventLog) {
      eventCursor = JSON.parse(lastEventLog.eventId);
    }
    console.log("Last event id", eventCursor);
    const provider = getRPCConnection();
    const eventQuery = {
      MoveModule: {
        package: process.env.PACKAGE_OBJECT_ID,
        module: "marketplace"
      }
    };

    let candidateEvents = [];
    const events = await provider.queryEvents({ query: eventQuery, cursor: eventCursor, order: 'ascending' });
    console.log(`Fetched ${events.data.length} events`)
    if (events.data.length === 0 ) {
      return [];
    }

    const eventIds = events["data"].map((data) => JSON.stringify(data.id));
    const existingEvents = await this.eventLogRepository.createQueryBuilder("eventlog")
    .where('eventlog.eventId IN (:...keys)', { keys: eventIds })
    .getMany();
    const existingEventIds = existingEvents.map((e) => e.eventId);
    for (const eventData of events["data"]) {
      const eventId = JSON.stringify(eventData.id);
      if (existingEventIds.includes(eventId) === false) {
        const eventLog = new EventLog();
        eventLog.transactionId = eventData.id.txDigest;
        eventLog.eventId = eventId;
        eventLog.timestamp = eventData.timestampMs?.toString();
        eventLog.rawData = JSON.stringify(eventData);
        await eventLog.save();
      }
      candidateEvents.push(eventData);
    }

    return candidateEvents;
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
