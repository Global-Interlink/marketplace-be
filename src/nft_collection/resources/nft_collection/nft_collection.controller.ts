import { SentryInterceptor } from './../../../sentry.interceptor';
import { JwtAuthGuard } from './../../../auth/guards/jwt-auth.guard';
import { NFTCollection } from './../../entities/nft_collection.entity';
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
} from '@nestjs/common';
import { NftCollectionService } from './nft_collection.service';
import { CreateNftCollectionDto } from '../../dto/create-nft_collection.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
@UseInterceptors(SentryInterceptor)
@Controller('/api/v1/nft-collection')
export class NftCollectionController {
  constructor(private readonly nftCollectionService: NftCollectionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
      { name: 'featuredImage', maxCount: 1 },
    ]),
  )
  async create(
    @Request() req,
    @Body() createNftCollectionDto: CreateNftCollectionDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File;
      banner?: Express.Multer.File;
      featuredImage?: Express.Multer.File;
    },
  ) {
    const logo = files.logo ? files.logo[0] : null;
    const banner = files.banner ? files.banner[0] : null;
    const featuredImage = files.featuredImage ? files.featuredImage[0] : null;
    const creator = req.user;
    return this.nftCollectionService.create(
      createNftCollectionDto,
      logo,
      banner,
      featuredImage,
      creator,
    );
  }

  @Get()
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<NFTCollection>> {
    return this.nftCollectionService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  findAllMe(
    @Request() req,
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<NFTCollection>> {
    return this.nftCollectionService.findAllByUser(query, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.nftCollectionService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateNftCollectionDto: UpdateNftCollectionDto) {
  //   return this.nftCollectionService.update(+id, updateNftCollectionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.nftCollectionService.remove(+id);
  // }
}
