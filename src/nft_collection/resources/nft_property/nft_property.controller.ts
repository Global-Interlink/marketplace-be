import { SentryInterceptor } from '../../../sentry.interceptor';
import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NftPropertyService } from './nft_property.service';

@UseInterceptors(SentryInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/api/v1/nft-property')
@ApiTags("NFT")
export class NftPropertyController {
  constructor(
    private readonly nftPropertyService: NftPropertyService,
  ) {}

  @Get('/collection/:idCollection/filter-property-data')
  async findByCollection(
    @Param('idCollection') id: string
  ) {
    const filterPropertyData = await this.nftPropertyService.filterPropertyDataByCollection(id);
    let res = {};

    for (const filterProperty of filterPropertyData) {
      if (res[filterProperty.name]) {
        res[filterProperty.name].push({value: filterProperty.value, count: filterProperty.count});
      } else {
        res[filterProperty.name] = [{value: filterProperty.value, count: filterProperty.count}];
      }
    }

    return res;
  }
}
