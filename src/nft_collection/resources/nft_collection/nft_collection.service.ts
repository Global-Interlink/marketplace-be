import { User } from 'src/user/entities/user.entity';
import { NFTCollection } from './../../entities/nft_collection.entity';
import { Repository } from 'typeorm';
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
    // Validate
    if (!logo || !banner || !featuredImage) {
      throw new BadRequestException(
        'logo, banner, featuredImage are all required',
      );
    }
    const existingCollectionCount = await this.nftCollectionRepository.count({
      where: {
        name: createNftCollectionDto.name,
        creator: {
          id: creator.id,
        }
      }
    })
    if (existingCollectionCount > 0) {
      throw new BadRequestException(`Collection ${createNftCollectionDto.name} has been existed`);
    }

    // Upload to ipfs
    const results = await this.ipfsService.uploadMultiples([
      logo.buffer.toString('base64'),
      banner.buffer.toString('base64'),
      featuredImage.buffer.toString('base64'),
    ]);
    const [logoUrl, bannerUrl, featuredImageUrl] = results;
    let collection = new NFTCollection();
    collection.name = createNftCollectionDto.name;
    collection.description = createNftCollectionDto.description;
    collection.logo = logoUrl.toString();
    collection.logoFileType = logo.mimetype;
    collection.banner = bannerUrl.toString();
    collection.bannerFileType = banner.mimetype;
    collection.featuredImage = featuredImageUrl.toString();
    collection.featuredImageFileType = featuredImage.mimetype;
    collection.creator = creator;
    collection = await this.nftCollectionRepository.save(collection);
    return collection;
  }

  findAll(query: PaginateQuery): Promise<Paginated<NFTCollection>> {
    const queryBuilder = this.nftCollectionRepository
      .createQueryBuilder('collections')
      .leftJoinAndSelect('collections.creator', 'creator')
      .leftJoinAndSelect('creator.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
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

  findOne(id: string, relations: string[] = []) {
    return this.nftCollectionRepository.findOne({
      where: {
        id: id,
      },
      //todo-hiep: sua relation sau
      relations : {
        creator: {
          address : true
        }
      }
    });
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
