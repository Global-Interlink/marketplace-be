import { Auction } from './entities/auction.entity';
import { SaleItem } from './entities/sale_item.entity';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSaleItemDto } from './dto/create-sale_item.dto';
import { UpdateSaleItemDto } from './dto/update-sale_item.dto';
import { In, LessThan, Repository } from 'typeorm';
import { SaleItemBuyType, SaleItemState } from './sale_item.constants';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { User } from 'src/user/entities/user.entity';
import { AuctionMethod } from './auction.constants';

@Injectable()
export class SaleItemService {
  constructor(
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
  ) {}

  async create(createSaleItemDto: CreateSaleItemDto, nft: NFT, user: User) {
    // validation auction
    if (nft.onSale()) {
      throw new BadRequestException('NFT is now on sale');
    }

    if (createSaleItemDto.buyType === SaleItemBuyType.AUCTION) {
      if (!createSaleItemDto.auction) {
        throw new BadRequestException('Auction info is required');
      }
      if (
        createSaleItemDto?.auction?.reservePrice !== null &&
        Number(createSaleItemDto?.auction?.startPrice) >=
          Number(createSaleItemDto?.auction?.reservePrice)
      ) {
        throw new BadRequestException(
          'Reserve price must be greater than start price',
        );
      }
      if (new Date(createSaleItemDto.auction.expiredAt) <= new Date()) {
        throw new BadRequestException('Expired at must be further than now');
      }
    }

    // create sale item
    const saleItem = new SaleItem();
    saleItem.nft = nft;
    saleItem.price = createSaleItemDto.price;
    saleItem.publishedBy = user;

    if (createSaleItemDto.buyType) {
      saleItem.buy_type = createSaleItemDto.buyType;
    }
    if (createSaleItemDto.buyType === SaleItemBuyType.AUCTION) {
      const auctionData = createSaleItemDto.auction;
      const auction = new Auction();
      auction.startPrice = auctionData.startPrice;
      auction.reservePrice = auctionData.reservePrice;
      auction.expiredAt = auctionData.expiredAt;
      auction.method =
        auctionData.method || AuctionMethod.SELL_TO_HIGHEST_BIDDER;

      // update sale item data
      saleItem.auction = await this.auctionRepository.save(auction);
    }
    return this.saleItemRepository.save(saleItem);
  }

  findAll() {
    return `This action returns all saleItem`;
  }

  async findOnSaleByIds(ids: string[], relations: string[] = []) {
    return await this.saleItemRepository.find({
      where: {
        id: In(ids),
        state: In([SaleItemState.ON_SALE, SaleItemState.VERIFING]),
      },
      relations: relations,
    });
  }

  async findOneOnSaleByNftId(nftId: string) {
    return await this.saleItemRepository.findOne({
      relations: {
        nft: true,
      },
      where: {
        nft: {
          id: nftId,
        },
        state: In([SaleItemState.ON_SALE, SaleItemState.VERIFING]),
      },
    });
  }

  findOne(id: string) {
    return this.saleItemRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        publishedBy: true,
      },
    });
  }

  async findSaleItemAuctionExpired() {
    return await this.saleItemRepository.find({
      where: {
        state: In([SaleItemState.ON_SALE, SaleItemState.NEED_TO_RE_COMFIRM]),
        buy_type: SaleItemBuyType.AUCTION,
        auction: {
          expiredAt: LessThan(new Date()),
        },
      },
      relations: {
        auction: {
          bids: {
            user: {
              address: true,
            },
          },
        },
        publishedBy: {
          address: true,
        },
        nft: true,
      },
    });
  }

  async updateState(id: string, state: SaleItemState) {
    const saleItem = await this.findOne(id);
    saleItem.state = state;
    return await this.saleItemRepository.save(saleItem);
  }

  async cancel(saleItem: SaleItem, user: User) {
    if (
      saleItem?.publishedBy?.id != user.id &&
      saleItem?.publishedById != user.id
    ) {
      throw new BadRequestException('Sale item is not created by you');
    }
    if (saleItem.state != SaleItemState.ON_SALE) {
      throw new BadRequestException('Sale item is not live now');
    }

    saleItem.state = SaleItemState.CANCELLED;
    return await this.saleItemRepository.save(saleItem);
  }

  update(id: number, updateSaleItemDto: UpdateSaleItemDto) {
    return `This action updates a #${id} saleItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} saleItem`;
  }
}
