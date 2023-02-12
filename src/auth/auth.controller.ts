import {
  Controller,
  Body,
  Post,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('/get-nonce')
  async getNonce(@Body() { walletAddress, chain }) {
    const nonce = await this.authService.getNonce(walletAddress, chain);
    return {
      nonce: nonce,
      walletAddress: walletAddress,
    };
  }
  
  // @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Body() { walletAddress, chain, signature }) {
    const user = await this.userService.findOneByWalletAddress(
      walletAddress,
      chain,
    );
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const verify: verifyMessageResult = await this.authService.verifyMessage(
      user,
      signature,
    );

    if (verify.error) {
      throw new BadRequestException("Signature is not valid");
    }
    const accessToken = await this.authService.generateJwt(user);

    return {
      walletAddress: walletAddress,
      chain: chain,
      accessToken: accessToken.access_token,
    };
  }
}
