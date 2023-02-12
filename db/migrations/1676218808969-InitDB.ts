import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1676218808969 implements MigrationInterface {
    name = 'InitDB1676218808969'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_state_enum" AS ENUM('paid', 'new')`);
        await queryRunner.query(`CREATE TABLE "order" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(24,6) NOT NULL DEFAULT '0', "state" "public"."order_state_enum" NOT NULL DEFAULT 'new', "buyerId" uuid, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nft_property" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "value" character varying NOT NULL, "nftId" uuid, CONSTRAINT "PK_183ed9eba8ef43c00b9383160e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "code" character varying(50) NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nft_collection" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "logo" character varying NOT NULL, "logoFileType" character varying, "banner" character varying NOT NULL, "bannerFileType" character varying, "featuredImage" character varying NOT NULL, "featuredImageFileType" character varying, "categoryId" integer, "creatorId" uuid, CONSTRAINT "PK_ffe58aa05707db77c2f20ecdbc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."nft_state_enum" AS ENUM('minted')`);
        await queryRunner.query(`CREATE TABLE "nft" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "onChainId" integer, "name" character varying NOT NULL, "description" character varying, "image" character varying NOT NULL, "fileType" character varying, "state" "public"."nft_state_enum" NOT NULL DEFAULT 'minted', "ownedDate" TIMESTAMP, "collectionId" uuid, "ownerId" uuid, CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sale_item_type_enum" AS ENUM('nft')`);
        await queryRunner.query(`CREATE TYPE "public"."sale_item_buy_type_enum" AS ENUM('buy_now', 'auction')`);
        await queryRunner.query(`CREATE TYPE "public"."sale_item_state_enum" AS ENUM('on_sale', 'sale_done', 'cancelled', 'need_to_re_confirm', 'verifing')`);
        await queryRunner.query(`CREATE TABLE "sale_item" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."sale_item_type_enum" NOT NULL DEFAULT 'nft', "buy_type" "public"."sale_item_buy_type_enum" NOT NULL DEFAULT 'buy_now', "price" numeric(24,6) NOT NULL DEFAULT '0', "state" "public"."sale_item_state_enum" NOT NULL DEFAULT 'on_sale', "lastChangedStateAt" TIMESTAMP, "auctionId" uuid, "nftId" uuid, "publishedById" uuid, "orderId" uuid, CONSTRAINT "REL_20e1dee611523c8e5e004c71cd" UNIQUE ("auctionId"), CONSTRAINT "PK_439a57a4a0d130329d3d2e671b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."auction_method_enum" AS ENUM('sell_to_highest_bidder')`);
        await queryRunner.query(`CREATE TABLE "auction" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "expiredAt" TIMESTAMP, "startPrice" numeric(24,6) NOT NULL DEFAULT '0', "reservePrice" numeric(24,6) DEFAULT '0', "method" "public"."auction_method_enum" NOT NULL DEFAULT 'sell_to_highest_bidder', CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bid" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "price" numeric(24,6) NOT NULL DEFAULT '0', "buyerSignature" character varying, "userId" uuid, "auctionId" uuid, CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sign_message" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" character varying NOT NULL, "expiredAt" TIMESTAMP NOT NULL, "usedAt" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "PK_b9f1000be23469e0764bb493340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "addressId" integer, CONSTRAINT "REL_217ba147c5de6c107f2fa7fa27" UNIQUE ("addressId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "address" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "address" character varying(200) NOT NULL, "networkId" integer, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "network" ("createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "network_id" character varying(200) NOT NULL, "provider_url" character varying, CONSTRAINT "PK_8f8264c2d37cbbd8282ee9a3c97" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_20981b2b68bf03393c44dd1b9d7" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_property" ADD CONSTRAINT "FK_9e9051f3c2ba31e332e60275fde" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD CONSTRAINT "FK_60d00b6f0b3a0803930b5258078" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD CONSTRAINT "FK_be0238a486437e8176bb3da6c06" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_941622072386aeece5112fe0db2" FOREIGN KEY ("collectionId") REFERENCES "nft_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_6c7967d2df644874a310f312511" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_20e1dee611523c8e5e004c71cd8" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_d9533c4e6c49b31d6b76d0e5fcc" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_b0f3894ec74339c2c9a0ae1aa97" FOREIGN KEY ("publishedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_eae4a28bf50e4554d81e15b102f" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_b0f254bd6d29d3da2b6a8af262b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bid" ADD CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sign_message" ADD CONSTRAINT "FK_89b0937afafa70c018cb63656b8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_cb5331f3042e3aca95345d4268d" FOREIGN KEY ("networkId") REFERENCES "network"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_cb5331f3042e3aca95345d4268d"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271"`);
        await queryRunner.query(`ALTER TABLE "sign_message" DROP CONSTRAINT "FK_89b0937afafa70c018cb63656b8"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6"`);
        await queryRunner.query(`ALTER TABLE "bid" DROP CONSTRAINT "FK_b0f254bd6d29d3da2b6a8af262b"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_eae4a28bf50e4554d81e15b102f"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_b0f3894ec74339c2c9a0ae1aa97"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_d9533c4e6c49b31d6b76d0e5fcc"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_20e1dee611523c8e5e004c71cd8"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_6c7967d2df644874a310f312511"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_941622072386aeece5112fe0db2"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP CONSTRAINT "FK_be0238a486437e8176bb3da6c06"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP CONSTRAINT "FK_60d00b6f0b3a0803930b5258078"`);
        await queryRunner.query(`ALTER TABLE "nft_property" DROP CONSTRAINT "FK_9e9051f3c2ba31e332e60275fde"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_20981b2b68bf03393c44dd1b9d7"`);
        await queryRunner.query(`DROP TABLE "network"`);
        await queryRunner.query(`DROP TABLE "address"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "sign_message"`);
        await queryRunner.query(`DROP TABLE "bid"`);
        await queryRunner.query(`DROP TABLE "auction"`);
        await queryRunner.query(`DROP TYPE "public"."auction_method_enum"`);
        await queryRunner.query(`DROP TABLE "sale_item"`);
        await queryRunner.query(`DROP TYPE "public"."sale_item_state_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sale_item_buy_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sale_item_type_enum"`);
        await queryRunner.query(`DROP TABLE "nft"`);
        await queryRunner.query(`DROP TYPE "public"."nft_state_enum"`);
        await queryRunner.query(`DROP TABLE "nft_collection"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "nft_property"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_state_enum"`);
    }

}
