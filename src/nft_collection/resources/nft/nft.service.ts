import { User } from 'src/user/entities/user.entity';
import { Not, Repository } from 'typeorm';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
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
import { UpdateFromBuyEventInputDto } from 'src/nft_collection/dto/common';
import { OrderService } from 'src/marketplace/order/order.service';

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    private nftCollectionService: NftCollectionService,
    private blockchainService: BlockchainService,
    private userService: UserService,
    private orderService: OrderService,
  ) {}

  async create(
    createNftDto: CreateNftDto,
    image: Express.Multer.File,
    creator: User,
  ) {
    return 'Not supported right now';
  }

  findOne(id: string) {
    return this.nftRepository.findOne({
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
      .leftJoinAndSelect('creator.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
      .where('nfts.collectionId = :collectionId', { collectionId })
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
      .leftJoinAndSelect('address.network', 'network')
      .where('nfts.ownerId = :userId', { userId })
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
    const collection = await this.nftRepository.findOne({
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

    return await this.nftRepository.find({
      relations: {
        collection: true,
      },
      where: {
        id: Not(nftId),
        collection: {
          id: collection.id,
        },
      },
      take: 8,
    });
  }

  async getAllNftByUser(user: User) {
    const nfts = await this.blockchainService.getNftsByUserAddress(
      user.address.address,
    );
    return {
      result: nfts,
    };
  }

  async updateFromBuyEvent(
    id: string,
    { txhash, chain }: UpdateFromBuyEventInputDto,
  ) {
    // verify
    // update buy user ( owner )
    const transaction = await this.blockchainService.getTransactionBuyByTxHash(
      txhash,
    );
    if (transaction.effects.status.status === 'failure') {
      throw new UnprocessableEntityException('Transaction is not success!');
    }
    const buyerAddress = (
      transaction.effects.created[0].owner as { AddressOwner: string }
    ).AddressOwner;

    const buyer = await this.userService.findOneByWalletAddress(
      buyerAddress,
      chain,
    );
    return this.orderService.updateBuyer(id, buyer);
  }
}
