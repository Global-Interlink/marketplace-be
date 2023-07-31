import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { NFTProperty } from 'src/nft_collection/entities/nft_property.entity';
import { Repository } from 'typeorm';
import { NftPropertyType } from './nft_property.type';
import { SaleItemState } from 'src/marketplace/sale_item/sale_item.constants';

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

  async detectNftProperty(nftData): Promise<NftPropertyType[]> {
    if (nftData.data.type  === '0xee496a0cc04d06a345982ba6697c90c619020de9e274408c7819f787ff66e1a1::suifrens::SuiFren<0x8894fa02fc6f36cbc485ae9145d05f247a78e220814fb8419ab261bd81f08f32::bullshark::Bullshark>') {
      return [
        {name: 'generation', value: nftData.data?.content?.fields.generation},
        {name: 'birthdate', value: nftData.data?.content?.fields.birthdate},
        {name: 'cohort', value: nftData.data?.content?.fields.cohort},
        {name: 'genes', value: nftData.data?.content?.fields.genes},
        {name: 'birth_location', value: nftData.data?.content?.fields.birth_location},
        {name: 'skin', value: nftData.data?.content?.fields.attributes[0]},
        {name: 'main_color', value: nftData.data?.content?.fields.attributes[1]},
        {name: 'secondary_color', value: nftData.data?.content?.fields.attributes[2]},
        {name: 'fin_style', value: nftData.data?.content?.fields.attributes[3]},
        {name: 'expression', value: nftData.data?.content?.fields.attributes[4]},
      ]
    }

    return [];
  }

  async filterPropertyDataByCollection(collectionId) {
    return this.nftPropertyRepository
      .createQueryBuilder('nftProperty')
      .select('nftProperty.name, nftProperty.value')
      .addSelect("COUNT(*)", "count")
      .innerJoin('nftProperty.nft', 'nft')
      .innerJoin('nft.saleItems', 'saleItems')
      .innerJoin('nft.collection', 'collection')
      .where('collection.id = :collectionId', { collectionId })
      .andWhere('saleItems.state = :state', { state: SaleItemState.ON_SALE })
      .groupBy('nftProperty.name, nftProperty.value')
      .getRawMany();
  }
}
