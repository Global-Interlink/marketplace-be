import { Auction } from 'src/marketplace/sale_item/entities/auction.entity';
import { Category } from './nft_collection/entities/category.entity';
import { SaleItem } from 'src/marketplace/sale_item/entities/sale_item.entity';
import { Order } from 'src/marketplace/order/entities/order.entity';
import { Network } from 'src/blockchain/entities/network.entity';
import { NFTProperty } from 'src/nft_collection/entities/nft_property.entity';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { NFTCollection } from 'src/nft_collection/entities/nft_collection.entity';
import { Module } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import * as dotenv from 'dotenv';
import { Address } from './blockchain/entities/address.entity';
import { User } from './user/entities/user.entity';
dotenv.config();

const DEFAULT_ADMIN = {
  email: process.env.DEFAULT_ADMIN_EMAIL,
  password: process.env.DEFAULT_ADMIN_PASSWORD,
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

AdminJS.registerAdapter({
  Resource: AdminJSTypeorm.Resource,
  Database: AdminJSTypeorm.Database,
});
@Module({
  imports: [
    AdminModule.createAdminAsync({
      useFactory: () => ({
        adminJsOptions: {
          rootPath: '/admin',
          resources: [
            Category,
            {
              resource: NFTCollection,
              options: {
                properties: {
                  description: {
                    type: 'richtext',
                  },
                },
              },
            },
            NFT,
            NFTProperty,
            User,
            {
              resource: Address,
              options: {
                properties: {
                  address: {
                    isTitle: 'true',
                  },
                },
              },
            },
            {
              resource: Network,
              options: {
                properties: {
                  network_id: {
                    isTitle: 'true',
                  },
                },
              },
            },
            {
              resource: Order,
              options: {
                properties: {
                  id: {
                    isTitle: 'true',
                  },
                },
              },
            },
            {
              resource: SaleItem,
              options: {
                properties: {
                  id: {
                    isTitle: 'true',
                  },
                },
              },
            },
            {
              resource: Auction,
              options: {
                properties: {
                  id: {
                    isTitle: 'true',
                  },
                },
              },
            },
          ],
        },
        auth: {
          authenticate,
          cookieName: 'adminjs',
          cookiePassword: 'secret',
        },
      }),
    }),
  ],
})
export class AdminConfigModule {}
