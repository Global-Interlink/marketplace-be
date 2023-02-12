import { SentryInterceptor } from './../../sentry.interceptor';
import { Web3Provider } from '@ethersproject/providers';
import { Injectable, UseInterceptors } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ethers, Wallet } from 'ethers';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { SaleItemService } from 'src/marketplace/sale_item/sale_item.service';
import OnusExchange from '../../blockchain/abi/OnusExchange.json';
import Web3 from 'web3';
import { SaleItemState } from 'src/marketplace/sale_item/sale_item.constants';
import { OrderService } from 'src/marketplace/order/order.service';
import { Express } from '@sentry/tracing/types/integrations';
import { NFTState } from 'src/nft_collection/constants/nft.constants';

@UseInterceptors(SentryInterceptor)
@Injectable()
export class CronService {
  constructor(
    private blockchainService: BlockchainService,
    private saleItemService: SaleItemService,
    private orderService: OrderService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async crawlAuctionExpired() {
    const network = await this.blockchainService.getNetworkBychain(
      'bsc_testnet',
    );
    const web3Provider = new ethers.providers.JsonRpcProvider(
      network.provider_url,
      {
        name: 'onus_testnet',
        chainId: 1945,
      },
    );
    const signer = new ethers.Wallet(
      process.env.ADMIN_PRIVATE_KEY,
      web3Provider,
    );
    const onusExchangeContract = new ethers.Contract(
      process.env.MARKET_ADDRESS,
      OnusExchange.abi,
      signer,
    );
    const data = await this.saleItemService.findSaleItemAuctionExpired();
    //each data
    Promise.all(
      data.map(async (saleItem) => {
        try {
          const highestBid = saleItem.auction.highestBid;
          if (!highestBid) {
            return await this.saleItemService.updateState(
              saleItem.id,
              SaleItemState.CANCELLED,
            );
          }
          // decode signature
          const sellerSignature = await this.getSignatureFromString(
            saleItem.signature,
          );
          const bidderSignature = await this.getSignatureFromString(
            saleItem.auction.highestBid.buyerSignature,
          );
          // data
          const adminData = {
            offchainOwner:
              saleItem.nft.onChainId != null &&
              saleItem.nft.state == NFTState.MINTED
                ? process.env.ZERO_ADDRESS
                : saleItem.publishedBy.address.address,
            collection: process.env.FACTORY_ADDRESS,
            amount: 1,
            uniqueIdOffchain:
              saleItem.nft.onChainId != null &&
              saleItem.nft.state == NFTState.MINTED
                ? saleItem.nft.onChainId
                : saleItem.nft.tokenId,
            ...JSON.parse(saleItem.nft.signAdmin),
          };
          const biderData = {
            orderType: 3,
            orderId: saleItem.clientId,
            signer: highestBid.user.address.address,
            collection: process.env.FACTORY_ADDRESS,
            price: ethers.utils
              .parseEther(Number(highestBid.price).toFixed(18))
              .toString(),
            tokenId:
              saleItem.nft.onChainId != null &&
              saleItem.nft.state == NFTState.MINTED
                ? saleItem.nft.onChainId
                : saleItem.nft.tokenId,
            amount: 1,
            strategy: process.env.STRATEGY_STANDARD_SALE_ADDRESS,
            currency: process.env.TOKEN_ADDRESS, // manus token
            startTime: 0,
            endTime: Math.floor(
              new Date(saleItem.auction.expiredAt).valueOf() / 1000,
            ),
            minPercentageToAsk: 0,
            ...bidderSignature,
          };
          const sellerData = {
            orderType: 2,
            orderId: saleItem.clientId,
            signer: saleItem.publishedBy.address.address,
            collection: process.env.FACTORY_ADDRESS,
            price: ethers.utils
              .parseEther(Number(saleItem.auction.startPrice).toFixed(18))
              .toString(),
            tokenId:
              saleItem.nft.onChainId != null &&
              saleItem.nft.state == NFTState.MINTED
                ? saleItem.nft.onChainId
                : saleItem.nft.tokenId,
            amount: 1,
            strategy: process.env.STRATEGY_STANDARD_SALE_ADDRESS,
            currency: process.env.TOKEN_ADDRESS, // manus token
            startTime: 0,
            endTime: Math.floor(
              new Date(saleItem.auction.expiredAt).valueOf() / 1000,
            ),
            minPercentageToAsk: 0,
            ...sellerSignature,
          };

          // change state sale item
          await this.saleItemService.updateState(
            saleItem.id,
            SaleItemState.VERIFING,
          );
          // call smart contract
          const tx = await onusExchangeContract
            .auction(biderData, sellerData, adminData)
            .catch(async (error) => {
              await this.saleItemService.updateState(
                saleItem.id,
                SaleItemState.NEED_TO_RE_COMFIRM,
              );
              console.log(error);
            });
          const resultTx = await tx.wait();
          if (resultTx.status == false) {
            await this.saleItemService.updateState(
              saleItem.id,
              SaleItemState.NEED_TO_RE_COMFIRM,
            );
            throw new Error('Transaction failed');
          } else {
            await this.orderService.create(
              {
                saleItemIds: [saleItem.id],
              },
              saleItem.auction.highestBid.user,
            );
          }
        } catch (error) {
          console.log(error);
        }
      }),
    );
  }

  @UseInterceptors(SentryInterceptor)
  @Cron(CronExpression.EVERY_30_SECONDS)
  async crawlDataOnBlockchain() {
    const data = await this.blockchainService.crawlData('bsc_testnet'); //todo-quang: hardcode
    return;
  }

  async getSignatureFromString(signature: string) {
    const singed = signature.substring(2);
    const r = '0x' + singed.substring(0, 64);
    const s = '0x' + singed.substring(64, 128);
    const v = parseInt(singed.substring(128, 130), 16);
    return { v, r, s };
  }
}
