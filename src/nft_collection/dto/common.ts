import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateFromBuyEventInputDto {
  @ApiProperty()
  txhash: string;

  @ApiProperty()
  chain: string;
}

export class UpdatePutOnSaleEventBodyDto extends PartialType(
  UpdateFromBuyEventInputDto,
) {}

export class UpdateDelistEventBodyDto extends PartialType(
  UpdateFromBuyEventInputDto,
) {}
