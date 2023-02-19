import { NFTCollection } from './../../nft_collection/entities/nft_collection.entity';
import { NFT } from './../../nft_collection/entities/nft.entity';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { SaleItemService } from './../sale_item/sale_item.service';
import { Order } from './entities/order.entity';
import { User } from './../../user/entities/user.entity';
import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleItemState } from '../sale_item/sale_item.constants';
import { OrderState } from './order.constants';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    private saleItemService: SaleItemService,
  ) {}

  async create(createOrderDto: CreateOrderDto, buyer: User) {
    // get sale items data
    const saleItems = await this.saleItemService.findOnSaleByIds(
      createOrderDto.saleItemIds,
      ['nft.owner'],
    );
    // validation
    if (saleItems.length < createOrderDto.saleItemIds.length) {
      throw new BadRequestException('All sale items must be both on sale.');
    }

    // Get total amount
    let totalAmount = 0;
    for (let i = 0; i < saleItems.length; i++) {
      totalAmount += saleItems[i].price;
    }

    // Create order
    let order = new Order();
    order.amount = totalAmount;
    order.state = OrderState.PAID;
    order = await this.orderRepository.save(order);

    // update sale item data & nft data
    for (let i = 0; i < saleItems.length; i++) {
      const saleItem = saleItems[i];
      // update sale item
      saleItem.state = SaleItemState.SALE_DONE;
      saleItem.order = order;

      // update nft owner
      const nft = saleItem.nft;
      nft.owner = buyer;

      this.nftRepository.save(nft);
      this.saleItemRepository.save(saleItem);
    }
    return order;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
