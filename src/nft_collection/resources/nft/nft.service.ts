import { User } from 'src/user/entities/user.entity';
import { Collection, Repository } from 'typeorm';
import { IpfsService } from '../../../common/ipfs/ipfs.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateNftCollectionDto } from '../../dto/update-nft_collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { CreateNftDto } from 'src/nft_collection/dto/create-nft.dto';
import { NftPropertyService } from '../nft_property/nft_property.service';
import { NftPropertyType } from '../nft_property/nft_property.type';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { NFTCollection } from 'src/nft_collection/entities/nft_collection.entity';
import { NftCollectionService } from '../nft_collection/nft_collection.service';
import Web3 from 'web3';

@Injectable()
export class NftService {
  constructor(
    private ipfsService: IpfsService,
    private nftProperyService: NftPropertyService,
    private nftCollectioService: NftCollectionService,
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
  ) {}

  async create(
    createNftDto: CreateNftDto,
    image: Express.Multer.File,
    creator: User,
  ) {
    // Validate
    if (!image) {
      throw new BadRequestException('image required');
    }

    // Upload to ipfs
    const imageIpfs = await this.ipfsService.upload(
      image.buffer.toString('base64'),
    );

    // find collection
    const collection = await this.nftCollectioService.findOneByUser(
      createNftDto.collectionId,
      creator,
    );
    // Validate
    if (!collection) {
      throw new BadRequestException('invalid collection');
    }

    // save NFT
    const nft = new NFT({
      name: createNftDto.name,
      description: createNftDto.description,
      image: imageIpfs.toString(),
      creator: creator,
      owner: creator,
      fileType: image.mimetype,
    });
    if (collection) {
      nft.collection = collection;
    }

    const savedNft = await this.nftRepository.save(nft);

    // Admin Sign
    const adminStruct = {
      offchainOwner: nft.owner.address.address,
      collection: process.env.FACTORY_ADDRESS, // NFT Factory address
      amount: 1,
      uniqueIdOffchain: nft.tokenId,
    };
    const hashAdmin = await this.hash_admin_f(adminStruct);
    const signData = await this.sign_hash(
      hashAdmin,
      process.env.ADMIN_PRIVATE_KEY,
    );

    // save sign admin
    savedNft.signAdmin = JSON.stringify(signData);
    await this.nftRepository.save(savedNft);

    // save nft property
    const propertyData = JSON.parse(createNftDto.property);

    Promise.all(
      propertyData.map(async (item: NftPropertyType) => {
        await this.nftProperyService.create(item, nft);
      }),
    );

    return nft;
  }

  findOne(id: string) {
    return this.nftRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        saleItems: {
          auction: {
            bids: true
          }
        },
        owner: {
          address: true,
        },
        creator: {
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
      .leftJoinAndSelect('nfts.creator', 'creator')
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
      .leftJoinAndSelect('nfts.creator', 'creator')
      .leftJoinAndSelect('nfts.collection', 'collection')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('creator.address', 'address')
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

  async sign_hash(inputHash: String, pkeyConfig: String) {
    const ethUtil = require('ethereumjs-util');
    var signature = { v: 0, r: '', s: '' };
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
      process.env.PREFIX_DOMAIN + maker_order_hash!.slice(2),
    );
    return prefix_hash!.slice(2);
  }
}
