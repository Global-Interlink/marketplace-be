import { IsNotEmpty } from 'class-validator';
import { AuctionMethod } from './../auction.constants';
import { SaleItemBuyType } from './../sale_item.constants';

class CreateSaleItemAuctionDto {
    @IsNotEmpty()
    expiredAt: Date

    @IsNotEmpty()
    startPrice: number
    
    reservePrice?: number
    method?: AuctionMethod
}

export class CreateSaleItemDto {
    nftId?: any
    price?: number
    buyType?: SaleItemBuyType
    auction?: CreateSaleItemAuctionDto
    signature: string
    clientId?: number
}
