import { User } from 'src/user/entities/user.entity';
import { NFTCollection } from './../../entities/nft_collection.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { IpfsService } from './../../../common/ipfs/ipfs.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNftCollectionDto } from '../../dto/create-nft_collection.dto';
import { UpdateNftCollectionDto } from '../../dto/update-nft_collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';
import { SaleItemState } from 'src/marketplace/sale_item/sale_item.constants';

@Injectable()
export class NftCollectionService {
  constructor(
    private ipfsService: IpfsService,
    @InjectRepository(NFTCollection)
    private nftCollectionRepository: Repository<NFTCollection>,
  ) {}

  async create(
    createNftCollectionDto: CreateNftCollectionDto,
    logo: Express.Multer.File,
    banner: Express.Multer.File,
    featuredImage: Express.Multer.File,
    creator: User,
  ) {
    return 'not supported right now';
  }

  async findAll(query: PaginateQuery): Promise<Paginated<NFTCollection>> {
    const queryBuilder = this.nftCollectionRepository
      .createQueryBuilder('collections')
      .leftJoinAndSelect('collections.creator', 'creator')
      .leftJoinAndSelect('creator.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
      .leftJoinAndSelect('collections.nfts', 'nfts')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .orderBy('collections.createdDate', 'DESC');

    const pagingData = await paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {},
    });

    const dataAfterCountNfts = pagingData.data.map((collection) => {
      const nftsOnsale = collection.nfts.filter((nft) =>
        nft.saleItems.some((item: any) => item.state === SaleItemState.ON_SALE),
      );
      delete collection.nfts;
      return {
        ...collection,
        totalNfts: nftsOnsale.length,
      };
    });

    pagingData.data = dataAfterCountNfts as any;
    return pagingData;
  }

  findAllByUser(
    query: PaginateQuery,
    user: User,
  ): Promise<Paginated<NFTCollection>> {
    const userId = user.id;
    const queryBuilder = this.nftCollectionRepository
      .createQueryBuilder('collections')
      .leftJoinAndSelect('collections.creator', 'creator')
      .leftJoinAndSelect('creator.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
      .where('collections.creatorId = :userId', { userId })
      .orderBy('collections.createdDate', 'DESC');

    return paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {},
    });
  }

  findOne(id: string, relations?: FindOptionsRelations<NFTCollection>) {
    return this.nftCollectionRepository.findOne({
      where: {
        id: id,
      },
      relations,
    });
  }

  async getDetailCollection(id: string) {
    const collection = await this.nftCollectionRepository
      .createQueryBuilder('collections')
      .leftJoinAndSelect('collections.nfts', 'nfts')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .where('collections.id = :id', { id })
      .getOne();
    const nftsOnsale = collection.nfts.filter((nft) =>
      nft.saleItems.some((item: any) => item.state === SaleItemState.ON_SALE),
    );
    delete collection.nfts;
    return {
      ...collection,
      totalNfts: nftsOnsale.length,
    };
  }

  findOneByUser(id: string, user: User) {
    const userId = user.id;
    return this.nftCollectionRepository.findOne({
      where: {
        id: id,
        creator: {
          id: userId,
        },
      },
    });
  }

  update(id: number, updateNftCollectionDto: UpdateNftCollectionDto) {
    return `This action updates a #${id} nftCollection`;
  }

  remove(id: number) {
    return `This action removes a #${id} nftCollection`;
  }
}
