import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';

import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignMessage } from './entities/signmessage.entity';
import { User } from './entities/user.entity';
import { randomUUID } from 'crypto';
import { NFT } from 'src/nft_collection/entities/nft.entity';
import { SaleItemState } from 'src/marketplace/sale_item/sale_item.constants';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(SignMessage)
    private signMessageRepository: Repository<SignMessage>,
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    private blockchainService: BlockchainService,
  ) {}

  async allUser() {
    return this.usersRepository.find()
  }

  async createUser(createUserDto: CreateUserDto) {
    const { walletAddress, chain } = createUserDto;
    const address = await this.blockchainService.createWallet(
      walletAddress,
      chain,
    );
    const user = new User();
    user.address = address;
    if (await this.usersRepository.save(user)) {
      await this.createMessage(walletAddress, chain);
    }
    return user;
  }

  async getMyInfo(user: User) {
    const [_, totalItems] = await this.nftRepository.findAndCount({
      relations: { owner: true },
      where: {
        owner: {
          id: user.id,
        },
      },
    });
    const userId = user.id;
    const nftOnSale = await this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .where('owner.id = :userId', { userId })
      .andWhere('saleItems.state = :state', { state: SaleItemState.ON_SALE })
      .getMany();

    let nft_onsale_ids = nftOnSale.map((nft) => nft.id);

    let queryBuilder = this.nftRepository
      .createQueryBuilder('nfts')
      .leftJoinAndSelect('nfts.collection', 'collection')
      .leftJoinAndSelect('nfts.owner', 'owner')
      .leftJoinAndSelect('owner.address', 'address')
      .leftJoinAndSelect('address.network', 'network')
      .leftJoinAndSelect('nfts.saleItems', 'saleItems')
      .where('owner.id = :userId', { userId })
      .orderBy('nfts.createdDate', 'DESC');

    if (nft_onsale_ids.length > 0) {
      queryBuilder = queryBuilder.andWhere('nfts.id NOT IN (:...ids)', {
        ids: nft_onsale_ids,
      });
    }
    const totalInMyWallet = await queryBuilder.getCount();

    return {
      totalItems,
      listedItems: nftOnSale.length,
      totalInMyWallet,
    };
  }

  async findOne(id: string) {
    return this.usersRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        address: {
          network: true,
        },
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOneByWalletAddress(walletAddress: string, chain: string = "SUI") {
    return await this.usersRepository.findOne({
      relations: {
        address: {
          network: true,
        },
      },
      where: {
        address: {
          address: walletAddress,
          network: {
            network_id: chain,
          },
        },
      },
    });
  }

  async createMessage(walletAddress: string, chain: string) {
    const user = await this.findOneByWalletAddress(walletAddress, chain);
    if (!user) {
      return false;
    }
    const signMessage = new SignMessage();
    signMessage.user = user;
    signMessage.expiredAt = new Date(Date.now() + 15 * 60000);
    signMessage.usedAt = new Date(Date.now() + 15 * 60000);
    signMessage.message = randomUUID();

    return await this.signMessageRepository.save(signMessage);
  }

  async getLastestMessage(walletAddress: string, chain: string) {
    return await this.signMessageRepository.findOne({
      where: {
        user: {
          address: {
            address: walletAddress,
            network: {
              network_id: chain,
            },
          },
        },
      },
      order: {
        createdDate: 'DESC',
      },
    });
  }
}
