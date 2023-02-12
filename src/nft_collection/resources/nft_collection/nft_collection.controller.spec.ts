import { Test, TestingModule } from '@nestjs/testing';
import { NftCollectionController } from './nft_collection.controller';
import { NftCollectionService } from './nft_collection.service';

describe('NftCollectionController', () => {
  let controller: NftCollectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftCollectionController],
      providers: [NftCollectionService],
    }).compile();

    controller = module.get<NftCollectionController>(NftCollectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
