import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { NFTProperty } from 'src/nft_collection/entities/nft_property.entity';
import { Repository } from 'typeorm';
import { NftPropertyType } from './nft_property.type';

@Injectable()
export class NftPropertyService {
  constructor(
    @InjectRepository(NFTProperty)
    private nftPropertyRepository: Repository<NFTProperty>,
  ) {}

  async create(data: NftPropertyType, nft: NFT) {
    const nftProperty = new NFTProperty();
    nftProperty.name = data.name;
    nftProperty.value = data.value;
    nftProperty.nft = nft;

    // save
    await this.nftPropertyRepository.save(nftProperty);
    return nftProperty;
  }
}
