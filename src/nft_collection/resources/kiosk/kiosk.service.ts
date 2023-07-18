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
    ownerAddress: string
  ) {
    const userId = ownerAddress;
    
    return this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('owner.address', 'address')
      .select('nfts.kioskId')
      .where('address.address = :ownerAddress', { ownerAddress })
      .orderBy('nfts.createdDate', 'DESC')
      .getMany()

  }
}
