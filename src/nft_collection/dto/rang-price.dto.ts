import { Optional } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class RangePriceDto {

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice: number;
}
