import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { Auction } from './../sale_item/entities/auction.entity';
import { User } from 'src/user/entities/user.entity';
import { Bid } from './entities/bid.entity';
import { BadRequestException, ClassSerializerInterceptor, Injectable, UseInterceptors } from '@nestjs/common';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleItemState } from '../sale_item/sale_item.constants';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,

    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
  ) {}
  
  async create(
    createBidDto: CreateBidDto,
    user: User
  ) {
    // validation
    const auction = await this.auctionRepository.findOne({
      where: {
        id: createBidDto.auctionId
      },
      relations: {
        bids: true,
        saleItem: true
      }
    });

    if (!auction) {
      throw new BadRequestException("Auction id not found");
    }

    const highestBid = auction.getHighestBid();
    if (highestBid && Number(createBidDto.price) <= highestBid.price) {
      throw new BadRequestException("Bid price must be greater than the highest bid");
    }

    const now = new Date();
    if (now > auction.expiredAt) {
      throw new BadRequestException("Auction has been expired");
    }
    
    if (Number(createBidDto.price) <= auction.startPrice) {
      throw new BadRequestException(`Bid price must be greater than ${auction.startPrice}`);
    }

    if (auction.reservePrice && Number(createBidDto.price) > auction.reservePrice) {
      throw new BadRequestException(`Bid price must be less than or equal ${auction.reservePrice}`);
    }

    if (auction.saleItem.state != SaleItemState.ON_SALE) {
      throw new BadRequestException("Sale is not live now");
    }

    const bid = new Bid();
    bid.user = user;
    bid.price = createBidDto.price;
    bid.auction = auction;
    bid.buyerSignature = createBidDto.buyerSignature;

    return this.bidRepository.save(bid);
  }

  findAllByAuctionId(
    query: PaginateQuery,
    auctionId: string
  ): Promise<Paginated<Bid>> {
    if (!auctionId) {
      throw new BadRequestException("Auction id is required in query string")
    }
    const queryBuilder = this.bidRepository
      .createQueryBuilder('bids')
      .leftJoinAndSelect('bids.auction', 'auction')
      .leftJoinAndSelect('bids.user', 'user')
      .leftJoinAndSelect('user.address', 'address')
      .where('auction.id = :auctionId', { auctionId })
      .orderBy('auction.createdDate', 'DESC');

    return paginate(query, queryBuilder, {
      sortableColumns: ['createdDate'],
      nullSort: 'last',
      defaultSortBy: [['createdDate', 'DESC']],
      filterableColumns: {},
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} bid`;
  }

  update(id: number, updateBidDto: UpdateBidDto) {
    return `This action updates a #${id} bid`;
  }

  remove(id: number) {
    return `This action removes a #${id} bid`;
  }
}
