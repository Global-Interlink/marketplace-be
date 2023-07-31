import { NftService } from 'src/nft_collection/resources/nft/nft.service';
import { SentryInterceptor } from './../../sentry.interceptor';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@UseInterceptors(SentryInterceptor)
@Injectable()
export class CronService {
  constructor(
    private nftService: NftService,
  ) {}

  @UseInterceptors(SentryInterceptor)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async syncEventLogFromOnChainMarketplace() {

    await this.nftService.syncMarketplaceEventToNft() ;
    return ;
  }
  @UseInterceptors(SentryInterceptor)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async syncEventLogFromOnChainKiosk() {
    await this.nftService.syncKioskEventToNft() ;
    return ;
  }

  // @UseInterceptors(SentryInterceptor)
  // @Cron(process.env.CRONTIME || '0 13 * * *')
  // async syncOwnerNft() {
  //   return await this.nftService.syncOwnerNfts();
  // }
}
