import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { SignMessage } from './entities/signmessage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, SignMessage]), BlockchainModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
