import { TypeOrmModule } from '@nestjs/typeorm';
import { NFTCollection } from './entities/nft_collection.entity';
import { IpfsService } from './../common/ipfs/ipfs.service';

import { Module } from '@nestjs/common';
import { NftCollectionService } from './resources/nft_collection/nft_collection.service';
import { NftCollectionController } from './resources/nft_collection/nft_collection.controller';
import { NftController } from './resources/nft/nft.controller';
import { NFT } from './entities/nft.entity';
import { NftService } from './resources/nft/nft.service';
import { NftPropertyService } from './resources/nft_property/nft_property.service';
import { NFTProperty } from './entities/nft_property.entity';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { Network } from 'src/blockchain/entities/network.entity';
import { Address } from 'src/blockchain/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NFTCollection,
      NFT,
      NFTProperty,
      Network,
      Address,
    ]),
  ],
  controllers: [NftCollectionController, NftController],
  providers: [
    NftCollectionService,
    NftService,
    IpfsService,
    NftPropertyService,
    BlockchainService,
  ],
  exports: [NftService],
})
export class NftCollectionModule {}
