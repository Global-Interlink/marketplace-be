import { SentryInterceptor } from './../../../sentry.interceptor';
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseInterceptors,
    UploadedFiles,
    UseGuards,
    Request,
    ClassSerializerInterceptor,
    Query,
  } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { KioskService } from './kiosk.service';
import { NftService } from '../nft/nft.service';
@UseInterceptors(SentryInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/api/v1/kiosk')

export class KioskController {
  constructor(
    private readonly kioskService: KioskService,
    
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('/list-kiosks/:ownerAddress')
  findAllNftByUser(@Param('ownerAddress') ownerAddress: string, @Paginate() query: PaginateQuery) {
    return this.kioskService.findAllKioskByOwnerId(query, ownerAddress);
  }
}