import { Address } from "src/blockchain/entities/address.entity";

export class CreateUserDto {
  walletAddress: string;
  chain : string;
}
