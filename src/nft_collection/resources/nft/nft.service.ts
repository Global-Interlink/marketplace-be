import { User } from 'src/user/entities/user.entity';
import { Not, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { CreateNftDto } from 'src/nft_collection/dto/create-nft.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { NFTCollection } from 'src/nft_collection/entities/nft_collection.entity';
import { NftCollectionService } from '../nft_collection/nft_collection.service';
import Web3 from 'web3';
import * as ethUtil from 'ethereumjs-util';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { UserService } from 'src/user/user.service';
import {
  UpdateFromBuyEventInputDto,
  UpdatePutOnSaleEventBodyDto,
} from 'src/nft_collection/dto/common';
import { OrderService } from 'src/marketplace/order/order.service';
import { SaleItemService } from 'src/marketplace/sale_item/sale_item.service';
import { NFTDto } from 'src/nft_collection/dto/list-nft.dto';
import { SaleItemBuyType } from 'src/marketplace/sale_item/sale_item.constants';
import { SaleItemState } from 'src/marketplace/sale_item/sale_item.constants';


@Injectable()
export class NftService {
  constructor(
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    private nftCollectionService: NftCollectionService,
    private blockchainService: BlockchainService,
    private userService: UserService,
    private orderService: OrderService,
    private saleItemService: SaleItemService,
  ) {}

  async create(
    createNftDto: CreateNftDto,
    image: Express.Multer.File,
    creator: User,
  ) {
    return 'Not supported right now';
  }

  async findOne(id: string) {
    return await this.nftRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        saleItems: {
          auction: {
            bids: true,
          },
        },
        owner: {
          address: true,
        },
        collection: true,
        properties: true,
      },
    });
  }

  async findByCollection(query: PaginateQuery, collection: NFTCollection) {
    const collectionId = collection.id;
    const queryBuilder = this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('owner.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .leftJoinAndSelect('nfts.collection', 'collection')
      .where('collection.id = :collectionId', { collectionId })
      .andWhere('saleItems.state = :state', { state: SaleItemState.ON_SALE })
      .orderBy('nfts.createdDate', 'DESC');

    return paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {},
    });
  }

  async findAllByUser(
    query: PaginateQuery,
    user: User,
  ): Promise<Paginated<NFT>> {
    const userId = user.id;
    const queryBuilder = this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.collection', 'collection')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .leftJoinAndSelect('owner.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
      .where('owner.id = :userId', { userId })
      .andWhere('saleItems.state <> :state', { state: SaleItemState.ON_SALE })
      .orderBy('nfts.createdDate', 'DESC');

    return paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {},
    });
  }

  remove(id: number) {
    return `This action removes a #${id} nftCollection`;
  }

  async sign_hash(inputHash: string, pkeyConfig: string) {
    const signature = { v: 0, r: '', s: '' };
    const signature_getting = ethUtil.ecsign(
      Buffer.from(inputHash, 'hex'),
      Buffer.from(pkeyConfig, 'hex'),
    );
    (signature.r = ethUtil.bufferToHex(signature_getting.r)),
      (signature.s = ethUtil.bufferToHex(signature_getting.s)),
      (signature.v = signature_getting.v);
    return signature;
  }

  async hash_admin_f(adminStruct: any) {
    const encode =
      process.env.MAKER_ADMIN_HASH +
      adminStruct.offchainOwner.toLowerCase().slice(2).padStart(64, '0') +
      adminStruct.collection.toLowerCase().slice(2).padStart(64, '0') +
      BigInt(adminStruct.amount.toString()).toString(16).padStart(64, '0') +
      BigInt(adminStruct.uniqueIdOffchain.toString())
        .toString(16)
        .padStart(64, '0');

    const maker_order_hash = Web3.utils.sha3(encode);
    const prefix_hash = Web3.utils.sha3(
      process.env.PREFIX_DOMAIN + maker_order_hash?.slice(2),
    );
    return prefix_hash?.slice(2);
  }

  async findAllOtherNfts(nftId: string) {
    const nft = await this.nftRepository.findOne({
      where: { id: nftId },
      relations: {
        collection: true,
      },
      select: {
        collection: {
          id: true,
        },
      },
    });

    const data = await this.nftRepository.find({
      relations: {
        collection: true,
        saleItems: true,
        owner: {
          address: true,
        },
      },
      where: {
        id: Not(nftId),
        ...(!!nft?.collection?.id && {
          collection: {
            id: nft?.collection.id,
          },
        }),
        saleItems: {
          state: SaleItemState.ON_SALE,
        },
      },
      take: 8,
    });
    return { data };
  }

  async saveNftFromOnChainData(nft: NFTDto, user: User) {
    const existed = await this.nftRepository.findOne({
      relations: { collection: true },
      where: { onChainId: nft.objectId },
    });

    if (existed && existed?.collection?.id) {
      return existed;
    }

    const collection = await this.nftCollectionService.findCollectionByNftUrl(
      nft.url,
    );

    if (existed && collection) {
      return await this.nftRepository.update(
        { id: existed.id },
        { collection: collection },
      );
    }

    if (!existed) {
      return await this.nftRepository.save({
        name: nft.name,
        onChainId: nft.objectId,
        owner: user,
        description: nft.description,
        nftType: nft.nftType,
        image: nft.url,
        ...(collection && { collection }),
      });
    }
  }

  async getAllNftByUser(user: User, query: PaginateQuery) {
    const nfts = await this.blockchainService.getNftsByUserAddress(
      user.address.address,
    );

    await Promise.all(nfts.map((i) => this.saveNftFromOnChainData(i, user)));

    const userId = user.id;
    const nft_on_sale = await this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .where('owner.id = :userId', { userId })
      .andWhere('saleItems.state = :state', { state: SaleItemState.ON_SALE })
      .getMany();

    let nft_onsale_ids = nft_on_sale.map((nft) => nft.id);
    
    let queryBuilder = this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.collection', 'collection')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('owner.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .where('owner.id = :userId', { userId })
      .orderBy('nfts.createdDate', 'DESC');
      
    if (nft_onsale_ids.length > 0) {
      queryBuilder = queryBuilder.andWhere('nfts.id NOT IN (:...ids)', {
        ids: nft_onsale_ids,
      });
    }
    return paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {},
    });
  }

  async updateFromBuyEvent(
    id: string,
    { txhash, chain }: UpdateFromBuyEventInputDto,
  ) {
    // verify
    // update buy user ( owner )
    // create order
    const transaction = await this.blockchainService.getTransactionBuyByTxHash(
      txhash,
    );
    if (transaction.effects.status.status === 'failure') {
      throw new UnprocessableEntityException('Transaction is not success!');
    }
    const buyEvent: any = transaction.effects.events.find((i: any) =>
      (i?.moveEvent?.type || '').includes('marketplace::BuyEvent'),
    );

    if (!buyEvent) {
      throw new BadRequestException('This is not transaction id of buy event!');
    }
    const buyerAddress = buyEvent?.moveEvent?.fields?.actor;

    const buyer = await this.userService.findOneByWalletAddress(
      buyerAddress,
      chain,
    );
    const saleItem = await this.saleItemService.findOneOnSaleByNftId(id);
    return this.orderService.create({ saleItemIds: [saleItem.id] }, buyer);
  }

  async updatePutOnSaleEvent(
    id: string,
    { txhash }: UpdatePutOnSaleEventBodyDto,
    user: User,
  ) {
    const nft = await this.findOne(id);
    const transaction: any =
      await this.blockchainService.getTransactionBuyByTxHash(txhash);

    const listEvent = transaction.effects.events.find((i: any) =>
      (i?.moveEvent?.type || '').includes('marketplace::ListEvent'),
    );

    if (!listEvent) {
      throw new BadRequestException(
        'This is not transaction id of list event!',
      );
    }
    return await this.saleItemService.create(
      {
        signature: null,
        nftId: id,
        auction: null,
        clientId: null,
        buyType: SaleItemBuyType.BUY_NOW,
        price: Number(listEvent?.moveEvent?.fields?.price) / Math.pow(10, 9),
      },
      nft as any,
      user,
    );
  }

  async getMyNftsListedOnMarket(user: User, query: PaginateQuery) {
    const userId = user.id;
    const queryBuilder = this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('nfts.collection', 'collection')
      .leftJoinAndSelect('owner.address', 'address')
      .where('owner.id = :userId', { userId })
      .andWhere('saleItems.state = :state', { state: SaleItemState.ON_SALE })
      .orderBy('nfts.createdDate', 'DESC');

    return paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {},
    });
  }

  async doDelistNft(nftId, user) {
    const nft = await this.nftRepository.findOne({
      relations: { saleItems: true, owner: true },
      where: {
        id: nftId,
        saleItems: {
          state: SaleItemState.ON_SALE,
        },
        owner: {
          id: user.id,
        },
      },
    });
    return await this.saleItemService.cancel(nft.saleItems[0], user);

  }
  async updateDelistEvent(
    id: string,
    { txhash }: UpdatePutOnSaleEventBodyDto,
    user: User,
  ) {
    const transaction: any =
      await this.blockchainService.getTransactionBuyByTxHash(txhash);
    const delistEvent = transaction.effects.events.find((i: any) =>
      (i?.moveEvent?.type || '').includes('marketplace::DelistEvent'),
    );
    if (!delistEvent) {
      throw new BadRequestException(
        'This is not transaction id of delist event!',
      );
    }
    await this.doDelistNft(id, user);
  }

  async syncMarketplaceEventToNft() {
    const newEvents = await this.blockchainService.getNewEventsInModule();
    console.log(`${newEvents.length} new events`);
    for (let i = 0; i < newEvents.length; i++) {
        const eventData = newEvents[i].event?.moveEvent;
        const eventType = newEvents[i].event?.moveEvent?.type;
        console.log("Event type", eventType);
        if (eventType && eventType.includes('marketplace::DelistEvent')) {
          console.log(`=== Handling DELIST event: ${JSON.stringify(eventData)}`);
          const nftOnchainId = eventData.fields.item_id;
          const userAddress = eventData.fields.actor;
          const nft = await this.nftRepository.findOne({
            relations: { saleItems: true },
            where: {
              onChainId: nftOnchainId
            }
          });
          if (nft && nft.saleStatus !== null) {
            console.log(">>> >>> Cancelling sale item")
            const user = await this.userService.findOneByWalletAddress(userAddress);
            await this.doDelistNft(nft.id, user);
          }
        }
        else if (eventType && eventType.includes('marketplace::ListEvent')) {
          console.log(`=== Handling LIST event: ${JSON.stringify(eventData)}`);
          const price = eventData.fields.price;
          const nftOnchainId = eventData.fields.item_id;
          const userAddress = eventData.fields.actor;
          const nft = await this.nftRepository.findOne({
            relations: { saleItems: true },
            where: {
              onChainId: nftOnchainId
            }
          });
          
          if (nft && nft.saleStatus === null) {
            console.log(">>> >>> Creating sale item")
            const user = await this.userService.findOneByWalletAddress(userAddress);
            await this.saleItemService.create(
              {
                signature: null,
                nftId: nft.id,
                auction: null,
                clientId: null,
                buyType: SaleItemBuyType.BUY_NOW,
                price: Number(price) / Math.pow(10, 9),
              },
              nft as any,
              user,
            );
          }
        }
        else if (eventType && eventType.includes('marketplace::BuyEvent')) {
          console.log(`=== Handling BUY event: ${JSON.stringify(eventData)}`);
          const nftOnchainId = eventData.fields.item_id;
          const userAddress = eventData.fields.actor;
          const nft = await this.nftRepository.findOne({
            relations: { saleItems: true },
            where: {
              onChainId: nftOnchainId
            }
          });
          
          if (nft && nft.saleStatus !== null) {
            console.log(">>> >>> Creating order")
            const user = await this.userService.findOneByWalletAddress(userAddress);
            const saleItem = await this.saleItemService.findOneOnSaleByNftId(nft.id);
            await this.orderService.create({ saleItemIds: [saleItem.id] }, user);
          }
        }
    }
  }
}
