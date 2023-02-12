import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { utils, Wallet } from 'ethers';
import { User } from 'src/user/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async getNonce(walletAddress: string, chain: string) {
    let user = await this.userService.findOneByWalletAddress(
      walletAddress,
      chain,
    );
    if (!user) {
      user = await this.userService.createUser({ walletAddress, chain });
    }
    const signMessage = await this.userService.createMessage(
      walletAddress,
      chain,
    );

    if (!signMessage) {
      return false;
    }
    // get signature for test
    // delete when front end match api
    // todo-quangdo: remove this
    let privateKey =
      '0x0123456789012345678901234567890123456789012345678901234567890123';
    let wallet = new Wallet(privateKey);
    let flatSig = await wallet.signMessage(signMessage.message);
    console.log(flatSig)
    return signMessage.message;
  }

  async verifyMessage(user: User, signature: string) {
    try {
      const signMessage = await this.userService.getLastestMessage(
        user.address.address,
        user.address.network.network_id,
      );

      const recoverMessage = utils.verifyMessage(
        signMessage.message,
        signature,
      );

      if (
        !recoverMessage ||
        user.address.address.toLowerCase() != recoverMessage.toLowerCase()
      ) {
        throw 'Invalid signature';
      }
      return {
        success: true,
      };
    } catch (error) {
      return {
        error: error,
      };
    }
  }

  async generateJwt(user: User) {
    const payload = {
      walletAddress: user.address.address,
      chain: user.address.network.network_id,
      userId: user.id
    };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY
      }),
    };
  }
}
