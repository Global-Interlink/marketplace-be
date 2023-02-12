import {
  IsDecimal,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateBidDto {
  @IsDecimal()
  @IsPositive()
  price: number;

  @IsString()
  auctionId: string;

  @IsString()
  buyerSignature: string;
}
