import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@Controller('/api/v1/bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() request,
    @Body() createBidDto: CreateBidDto
  ) {
    return this.bidService.create(
      createBidDto,
      request.user
    );
  }

  @Get()
  findAll(
    @Query() params: { auctionId: string },
    @Paginate() query: PaginateQuery
  ) {
    return this.bidService.findAllByAuctionId(query, params.auctionId);
  }
}
