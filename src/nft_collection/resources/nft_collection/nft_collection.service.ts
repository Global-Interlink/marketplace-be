import { User } from 'src/user/entities/user.entity';
import { NFTCollection } from './../../entities/nft_collection.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { IpfsService } from './../../../common/ipfs/ipfs.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNftCollectionDto } from '../../dto/create-nft_collection.dto';
import { UpdateNftCollectionDto } from '../../dto/update-nft_collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, paginate, Paginated } from 'nestjs-paginate';

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

  findAll(query: PaginateQuery): Promise<Paginated<NFTCollection>> {
    const queryBuilder = this.nftCollectionRepository
      .createQueryBuilder('collections')
      .leftJoinAndSelect('collections.creator', 'creator')
      .leftJoinAndSelect('creator.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
      .loadRelationCountAndMap('collections.totalNft', 'collections.nfts')
      .orderBy('collections.createdDate', 'DESC');

    return paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {},
    });
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

  getDetailCollection(id: string) {
    return this.nftCollectionRepository
      .createQueryBuilder('collections')
      .loadRelationCountAndMap('collections.totalNft', 'collections.nfts')
      .where('collections.id = :id', { id })
      .getOne();
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
