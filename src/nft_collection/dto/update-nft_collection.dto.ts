import { PartialType } from '@nestjs/mapped-types';
import { CreateNftCollectionDto } from './create-nft_collection.dto';

export class UpdateNftCollectionDto extends PartialType(CreateNftCollectionDto) {}
