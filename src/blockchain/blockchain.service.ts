import { SentryInterceptor } from './../sentry.interceptor';
import { Injectable, UnprocessableEntityException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { Network } from './entities/network.entity';
import { NFTDto } from 'src/nft_collection/dto/list-nft.dto';
import { ObjectId, PaginatedObjectsResponse, SuiObjectResponse, SuiTransactionBlockResponse } from '@mysten/sui.js';
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
    const objectIds = await this.getAllObjects(userAddress);
    const nftObjects = await this.getNftObjectsFromObjectIds(objectIds);

    const result = nftObjects.map((nft) => {
      const image_url = nft.data.content.fields.url || nft.data.content.fields.img_url || nft.data.display.data.image_url
      return {
        name: nft.data.content.fields?.name || nft.data.display.data.name,
        description: nft.data.content.fields?.description || nft.data.display.data?.description || null,
        url: encodeURI(image_url),
        objectId: nft.data.content.fields.id.id,
        owner: nft.data.owner.AddressOwner,
        nftType: nft.data.type,
        kioksId: nft.kioksId,
      };
    });

    return result;
  }

  async getNftObjectsFromObjectIds(objectIds, kioksObjectId?) {
    const detailOfObjects: any = await this.getMultiObjects(objectIds)

    let nftObjects = [];
    let dynamicFieldObjectIds = [];

    for (const obj of detailOfObjects) {
      if (obj.data?.content?.fields.nft !== undefined || (obj.data?.content?.fields.name !== undefined && 
        (obj.data?.content?.fields.img_url !== undefined || obj.data?.content?.fields.url !== undefined))) {
        nftObjects.push({...obj, kioksId: kioksObjectId});
      } else if (obj.data?.type.includes('kiosk::KioskOwnerCap')) {
        dynamicFieldObjectIds.push(obj.data?.content.fields.for);
      }
    }

    if (dynamicFieldObjectIds.length > 0) {
      for (const dynamicFieldId of dynamicFieldObjectIds) {
        const itemObjectIds = await this.getItemIdFromDynamicFields(dynamicFieldId);
        
        if (itemObjectIds.length > 0) {
          nftObjects.push(...(await this.getNftObjectsFromObjectIds(itemObjectIds, dynamicFieldId)));
        }
      }
    }

    return nftObjects;
  }

  async getItemIdFromDynamicFields(kioksObjectId: string, result?: string[], nextCursor?: any): Promise<string[]> {
    const provider = getRPCConnection();
    const dynamicFields = await provider.getDynamicFields({parentId: kioksObjectId, ...(nextCursor && { cursor: nextCursor }) });
    const nftObjectIds = dynamicFields.data.filter((x) => {
      return (
        x.name.type.includes('kiosk::Item')
      );
    }).map(obj => obj.objectId);
    const currentResult = result ? [...result, ...nftObjectIds] : nftObjectIds;

    if (!dynamicFields.hasNextPage) {
      return currentResult;
    }

    if (dynamicFields.nextCursor) {
      return await this.getItemIdFromDynamicFields(kioksObjectId, currentResult, dynamicFields.nextCursor);
    }

    return currentResult;
  }

  async getMultiObjects(objectIds: string[]): Promise<SuiObjectResponse[]> {
    const provider = getRPCConnection();
    const batches = await this.splitArrayIntoBatches(objectIds, 50);
    const detailObjects = []
    for (const ids of batches) {
      const objects: any = await provider.multiGetObjects({ids: ids, options: {
          showType: true,
          showContent: true,
          showOwner: true,
          showPreviousTransaction: true,
          showStorageRebate: true,
          showDisplay: true,
        }
      });

      detailObjects.push(...objects);
    }

    return detailObjects;
  }

  async getAllObjects(userAddress: string, result?: string[], nextCursor?: any): Promise<string[]> {
    const provider = getRPCConnection();
    const objects = await provider.getOwnedObjects({ owner: userAddress, ...(nextCursor && { cursor: nextCursor }) });
    const objectIds = objects.data.map((x) => x.data?.objectId)
    const currentResult = result ? [...result, ...objectIds] : objectIds;

    if (!objects.hasNextPage) {
      return currentResult;
    }

    if (objects.nextCursor) {
      return await this.getAllObjects(userAddress, currentResult, objects.nextCursor);
    }

    return currentResult;
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

  async splitArrayIntoBatches<T>(array: T[], batchSize: number): Promise<T[][]> {
    const batches: T[][] = [];
    const length = array.length;

    for (let i = 0; i < length; i += batchSize) {
      const batch = array.slice(i, i + batchSize);
      batches.push(batch);
    }

    return batches;
  }
}
