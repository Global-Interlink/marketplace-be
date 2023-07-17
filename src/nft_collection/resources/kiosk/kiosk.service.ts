import { In, Not, Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
@Injectable()
export class KioskService {
  constructor(
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>
  ) {}
  async findAllKioskByOwnerId(
    query: PaginateQuery,
    owner: string
  ): Promise<Paginated<NFT>> {
    const userId = owner;
    const queryBuilder = this.nftRepository
      .createQueryBuilder('nfts')
      .select('nfts.kioskId')
      .where('nfts.ownerId = :owner', { owner })
      .orderBy('nfts.createdDate', 'DESC');

    return paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {},
    });
  }
}
