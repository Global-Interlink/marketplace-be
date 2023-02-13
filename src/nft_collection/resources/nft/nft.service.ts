import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { IpfsService } from '../../../common/ipfs/ipfs.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { CreateNftDto } from 'src/nft_collection/dto/create-nft.dto';
import { NftPropertyService } from '../nft_property/nft_property.service';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { NFTCollection } from 'src/nft_collection/entities/nft_collection.entity';
import { NftCollectionService } from '../nft_collection/nft_collection.service';
import Web3 from 'web3';
import * as ethUtil from 'ethereumjs-util';

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
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
}
