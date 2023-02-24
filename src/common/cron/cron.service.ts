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
  @Cron(CronExpression.EVERY_30_SECONDS)
  async syncEventLogFromOnChainMarketplace() {
    return await this.nftService.syncMarketplaceEventToNft();
  }
}
