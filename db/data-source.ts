import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
import { Auction } from 'src/marketplace/sale_item/entities/auction.entity';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { Order } from 'src/marketplace/order/entities/order.entity';
import { Network } from 'src/blockchain/entities/network.entity';
import { NFTProperty } from 'src/nft_collection/entities/nft_property.entity';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { NFTCollection } from 'src/nft_collection/entities/nft_collection.entity';
import { User } from 'src/user/entities/user.entity';
import { Address } from 'src/blockchain/entities/address.entity';
import { Category } from 'src/nft_collection/entities/category.entity';
import { Bid } from 'src/marketplace/bid/entities/bid.entity';
import { SignMessage } from 'src/user/entities/signmessage.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    'dist/**/*.entity.js',
    Auction,
    SaleItem,
    Order,
    Network,
    NFTProperty,
    NFT,
    NFTCollection,
    User,
    Address,
    Category,
    Bid,
    SignMessage,
  ],
  migrations: ['dist/db/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
