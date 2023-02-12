import { Controller, Get, Post } from '@nestjs/common';
import { CronService } from './cron.service';

@Controller()
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post("test")
  getHello(): string {
    this.cronService.crawlAuctionExpired();
    return "test";
  }
}
