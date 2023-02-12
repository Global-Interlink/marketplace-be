import { SentryInterceptor } from './../../sentry.interceptor';
import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  BadRequestException,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { SaleItemService } from './sale_item.service';
import { CreateSaleItemDto } from './dto/create-sale_item.dto';
import { NftService } from 'src/nft_collection/resources/nft/nft.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseInterceptors(SentryInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('/api/v1/sale-item')
export class SaleItemController {
  constructor(
    private readonly saleItemService: SaleItemService,
    private readonly nftService: NftService,
  ) {}

  @Post()
  async create(@Request() req, @Body() createSaleItemDto: CreateSaleItemDto) {
    const nft = await this.nftService.findOne(createSaleItemDto.nftId);
    const seller = req.user;
    if (nft.owner.id.toLowerCase() !== req.user.id.toLowerCase()) {
      throw new BadRequestException('You are not the owner of this NFT');
    }
    if (nft.saleStatus && nft.saleStatus.onSale === true) {
      throw new BadRequestException('This NFT is already on sale');
    }
    return this.saleItemService.create(createSaleItemDto, nft, seller);
  }

  @Post(':id/cancel')
  async cancelSaleItem(@Request() req, @Param() params) {
    const saleItemId = params.id;
    const saleItem = await this.saleItemService.findOne(saleItemId);
    return this.saleItemService.cancel(saleItem, req.user);
  }
}
