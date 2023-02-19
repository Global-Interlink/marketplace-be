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
} from '@nestjs/common';
import { NftService } from './nft.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateNftDto } from 'src/nft_collection/dto/create-nft.dto';
import { NftCollectionService } from '../nft_collection/nft_collection.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { UpdateFromBuyEventInputDto } from 'src/nft_collection/dto/common';

@UseInterceptors(SentryInterceptor)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('/api/v1/nft')
export class NftController {
  constructor(
    private readonly nftService: NftService,
    private readonly nftCollectionService: NftCollectionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async create(
    @Request() req,
    @Body() createNftDto: CreateNftDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File;
    },
  ) {
    const image = files.image ? files.image[0] : null;
    const creator = req.user;
    return await this.nftService.create(createNftDto, image, creator);
  }

  @Get('/by-collection/:idCollection')
  async findByCollection(
    @Param('idCollection') id: string,
    @Paginate() query: PaginateQuery,
  ) {
    const collection = await this.nftCollectionService.findOne(id);
    return await this.nftService.findByCollection(query, collection);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async findAllMe(@Request() req, @Paginate() query: PaginateQuery) {
    return await this.nftService.findAllByUser(query, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.nftService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/others-in-collection')
  async findOtherNftsInCollection(@Param('id') id: string) {
    return this.nftService.findAllOtherNfts(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllNftByUser(@Request() request) {
    return this.nftService.getAllNftByUser(request.user);
  }

  // @UseGuards(JwtAuthGuard)
  @Post(':id/update-from-buy-event')
  updateFromBuyEvent(
    @Param('id') id: string,
    @Body() body: UpdateFromBuyEventInputDto,
  ) {
    return this.nftService.updateFromBuyEvent(id, body);
  }
}
