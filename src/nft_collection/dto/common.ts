import { ApiProperty } from '@nestjs/swagger';

export class UpdateFromBuyEventInputDto {
  @ApiProperty()
  txhash: string;

  @ApiProperty()
  chain: string;
}
