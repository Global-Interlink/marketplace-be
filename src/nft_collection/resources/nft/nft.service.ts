import { User } from 'src/user/entities/user.entity';
import { In, Not, Repository } from 'typeorm';
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
import { Address } from 'src/blockchain/entities/address.entity';

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    private nftCollectionService: NftCollectionService,
    private blockchainService: BlockchainService,
    private userService: UserService,
    private orderService: OrderService,
    private saleItemService: SaleItemService, // @InjectRepository(Address) // private addressRepository: Repository<Address>
  ) {}

  // async syncOwnerNfts() {
  //   console.log('Start sync owner nft ====================>');
  //   const users = await this.userService.allUser();
  //   for(const user of users) {
  //     const address = await this.addressRepository.findOne({where: {id: user.addressId}});
  //     const nfts = await this.blockchainService.getNftsByUserAddress(
  //       address.address,
  //     );

  //     const nftOnchainIds = nfts.map((nft) => nft.objectId);
  //     await this.removeOwnerNfts(user.id, nftOnchainIds);
  //     await Promise.all(nfts.map((i) => this.saveNftFromOnChainData(i, user)));
  //   }
  //   console.log('End sync owner nft <====================');
  // }

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

  async findByCollection(
    query: PaginateQuery,
    collection: NFTCollection,
    queryRangePrice: any,
  ) {
    console.log(queryRangePrice, 'eeee');
    const collectionId = collection.id;
    // const querySort =
    const queryBuilder = this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('owner.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .leftJoinAndSelect('nfts.collection', 'collection')
      .where('collection.id = :collectionId', { collectionId })
      .andWhere('saleItems.state = :state', { state: SaleItemState.ON_SALE });
    // .orderBy('nfts.createdDate', 'DESC')
    // .orderBy('saleItems.price', 'ASC')

    if (queryRangePrice.minPrice && queryRangePrice.maxPrice) {
      queryBuilder.andWhere(
        'saleItems.price >= :minPrice AND saleItems.price <= :maxPrice',
        {
          minPrice: Number(queryRangePrice.minPrice),
          maxPrice: Number(queryRangePrice.maxPrice),
        },
      );
    }

    if (queryRangePrice.sortBy) {
      const [sortPrice, typeSort] = queryRangePrice.sortBy.split(':');
      queryBuilder.orderBy(sortPrice, typeSort);
    }
    return paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {},
      relations: ['saleItems'],
    });
  }

  async getMinMaxPrice(collectionId: string) {
    const queryBuilder = this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .leftJoinAndSelect('nfts.collection', 'collection')
      .select(
        'MIN(saleItems.price) as minPriceNft , MAX(saleItems.price) as maxPriceNft',
      )
      .where('collection.id = :collectionId', { collectionId });

    return queryBuilder.getRawOne();
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

    if (!nft || !nft.collection?.id) {
      return {
        data: []
      }
    }

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
        collection: {
          id: nft.collection.id,
        },
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

    const nftDataUpdate = {
      name: nft.name,
      onChainId: nft.objectId,
      owner: user,
      description: nft.description,
      nftType: nft.nftType,
      image: nft.url,
    };

    if (existed && existed?.collection?.id) {
      return await this.nftRepository.update({ id: existed.id }, nftDataUpdate);
    }

    const collection =
      await this.nftCollectionService.findCollectionByCollectionType(
        nft.nftType,
      );

    if (existed) {
      return await this.nftRepository.update(
        { id: existed.id },
        {
          ...(collection && { collection }),
          ...nftDataUpdate,
        },
      );
    }

    return await this.nftRepository.save({
      ...nftDataUpdate,
      ...(collection && { collection }),
    });
  }

  async getAllNftByUser(user: User, query: PaginateQuery) {
    const nfts = await this.blockchainService.getNftsByUserAddress(
      user.address.address,
    );

    const nftOnchainIds = nfts.map((nft) => nft.objectId);
    await this.removeOwnerNfts(user.id, nftOnchainIds);
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

    const events = transaction.events;
    const buyEvent = events.find((e) =>
      e.type.includes('marketplace::BuyEvent'),
    );

    if (!buyEvent) {
      throw new BadRequestException('This is not transaction id of buy event!');
    }

    const buyer = await this.userService.findOneByWalletAddress(
      buyEvent.parsedJson.buyer || buyEvent.parsedJson.actor,
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

    const status = transaction.effects.status;
    if (status.status !== 'success') {
      throw new BadRequestException('This transaction is failed!');
    }

    const listEvent = transaction.events.find((i: any) =>
      (i?.type || '').includes('marketplace::ListEvent'),
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
        price: Number(listEvent?.parsedJson?.price) / Math.pow(10, 9),
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

    const status = transaction.effects.status;
    if (status.status !== 'success') {
      throw new BadRequestException('This transaction is failed!');
    }

    const delistEvent = transaction.events.find((i: any) =>
      (i?.type || '').includes('marketplace::DelistEvent'),
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
      const eventData = newEvents[i].parsedJson;
      const eventType = newEvents[i].type;
      console.log('Event type', eventType);
      if (eventType && eventType.includes('marketplace::DelistEvent')) {
        console.log(`=== Handling DELIST event: ${JSON.stringify(eventData)}`);
        const nftOnchainId = eventData.item_id;
        const userAddress = eventData.actor;
        const nft = await this.nftRepository.findOne({
          relations: { saleItems: true },
          where: {
            onChainId: nftOnchainId,
          },
        });
        if (nft && nft.saleStatus !== null) {
          console.log('>>> >>> Cancelling sale item');
          const user = await this.userService.findOneByWalletAddress(
            userAddress,
          );
          await this.doDelistNft(nft.id, user);
        }
      } else if (eventType && eventType.includes('marketplace::ListEvent')) {
        console.log(`=== Handling LIST event: ${JSON.stringify(eventData)}`);
        const price = eventData.price;
        const nftOnchainId = eventData.item_id;
        const userAddress = eventData.actor;
        const nft = await this.nftRepository.findOne({
          relations: { saleItems: true },
          where: {
            onChainId: nftOnchainId,
          },
        });

        if (nft && nft.saleStatus === null) {
          console.log('>>> >>> Creating sale item');
          const user = await this.userService.findOneByWalletAddress(
            userAddress,
          );
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
      } else if (eventType && eventType.includes('marketplace::BuyEvent')) {
        console.log(`=== Handling BUY event: ${JSON.stringify(eventData)}`);
        const nftOnchainId = eventData.item_id;
        const userAddress = eventData.buyer || eventData.actor;
        const nft = await this.nftRepository.findOne({
          relations: { saleItems: true },
          where: {
            onChainId: nftOnchainId,
          },
        });

        if (nft && nft.saleStatus !== null) {
          console.log('>>> >>> Creating order');
          const user = await this.userService.findOneByWalletAddress(
            userAddress,
          );
          const saleItem = await this.saleItemService.findOneOnSaleByNftId(
            nft.id,
          );
          await this.orderService.create({ saleItemIds: [saleItem.id] }, user);
        }
      }
    }
  }

  async removeOwnerNfts(userId, nftOnchainIds) {
    const nftSelling = await this.nftRepository
      .createQueryBuilder('nfts')
      .innerJoin('nfts.saleItems', 'saleItems')
      .where('nfts.ownerId = :userId', { userId })
      .andWhere('saleItems.state IN (:...states)', {
        states: [SaleItemState.ON_SALE, SaleItemState.VERIFING],
      })
      .getMany();

    await this.nftRepository.update(
      {
        onChainId: Not(
          In([...nftOnchainIds, ...nftSelling.map((e) => e.onChainId)]),
        ),
        ownerId: userId,
      },
      { ownerId: null },
    );
  }
}
