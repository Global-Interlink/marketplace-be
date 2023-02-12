import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockchainService } from 'src/blockchain/blockchain.service';

import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignMessage } from './entities/signmessage.entity';
import { User } from './entities/user.entity';
import { randomUUID } from 'crypto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(SignMessage)
    private signMessageRepository: Repository<SignMessage>,
    private blockchainService: BlockchainService,
  ) {}

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

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    return this.usersRepository.findOne({
      where: {
        id: id
      },
      relations: {
        address: {
          network: true
        }
      }
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOneByWalletAddress(walletAddress: string, chain: string) {
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
    let lastestMessage = await this.signMessageRepository.findOne({
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
    return lastestMessage;
  }
}
