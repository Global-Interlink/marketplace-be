import { MigrationInterface, QueryRunner } from "typeorm";

export class updateNftUrl1677080533160 implements MigrationInterface {
    name = 'updateNftUrl1677080533160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "nftUrls" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "website_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "facebook_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "twitter_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "github_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "telegram_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "instagram_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "discord_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "youtube_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "reddit_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_property" DROP CONSTRAINT "FK_9e9051f3c2ba31e332e60275fde"`);
        await queryRunner.query(`ALTER TABLE "nft_property" ALTER COLUMN "nftId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP CONSTRAINT "FK_60d00b6f0b3a0803930b5258078"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP CONSTRAINT "FK_be0238a486437e8176bb3da6c06"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "categoryId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "creatorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_941622072386aeece5112fe0db2"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_6c7967d2df644874a310f312511"`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "collectionId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "ownerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "nftType" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_d9533c4e6c49b31d6b76d0e5fcc"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_b0f3894ec74339c2c9a0ae1aa97"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_eae4a28bf50e4554d81e15b102f"`);
        await queryRunner.query(`ALTER TABLE "sale_item" ALTER COLUMN "nftId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sale_item" ALTER COLUMN "publishedById" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sale_item" ALTER COLUMN "orderId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_20981b2b68bf03393c44dd1b9d7"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "buyerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_cb5331f3042e3aca95345d4268d"`);
        await queryRunner.query(`ALTER TABLE "address" ALTER COLUMN "networkId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sign_message" DROP CONSTRAINT "FK_89b0937afafa70c018cb63656b8"`);
        await queryRunner.query(`ALTER TABLE "sign_message" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "addressId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_fde3bf080648f0b8e4ef82ec94" ON "nft_collection" ("nftUrls") `);
        await queryRunner.query(`ALTER TABLE "nft_property" ADD CONSTRAINT "FK_9e9051f3c2ba31e332e60275fde" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD CONSTRAINT "FK_60d00b6f0b3a0803930b5258078" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD CONSTRAINT "FK_be0238a486437e8176bb3da6c06" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_941622072386aeece5112fe0db2" FOREIGN KEY ("collectionId") REFERENCES "nft_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_6c7967d2df644874a310f312511" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_d9533c4e6c49b31d6b76d0e5fcc" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_b0f3894ec74339c2c9a0ae1aa97" FOREIGN KEY ("publishedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_eae4a28bf50e4554d81e15b102f" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_20981b2b68bf03393c44dd1b9d7" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_cb5331f3042e3aca95345d4268d" FOREIGN KEY ("networkId") REFERENCES "network"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sign_message" ADD CONSTRAINT "FK_89b0937afafa70c018cb63656b8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271"`);
        await queryRunner.query(`ALTER TABLE "sign_message" DROP CONSTRAINT "FK_89b0937afafa70c018cb63656b8"`);
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_cb5331f3042e3aca95345d4268d"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_20981b2b68bf03393c44dd1b9d7"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_eae4a28bf50e4554d81e15b102f"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_b0f3894ec74339c2c9a0ae1aa97"`);
        await queryRunner.query(`ALTER TABLE "sale_item" DROP CONSTRAINT "FK_d9533c4e6c49b31d6b76d0e5fcc"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_6c7967d2df644874a310f312511"`);
        await queryRunner.query(`ALTER TABLE "nft" DROP CONSTRAINT "FK_941622072386aeece5112fe0db2"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP CONSTRAINT "FK_be0238a486437e8176bb3da6c06"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP CONSTRAINT "FK_60d00b6f0b3a0803930b5258078"`);
        await queryRunner.query(`ALTER TABLE "nft_property" DROP CONSTRAINT "FK_9e9051f3c2ba31e332e60275fde"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fde3bf080648f0b8e4ef82ec94"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "addressId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_217ba147c5de6c107f2fa7fa271" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sign_message" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sign_message" ADD CONSTRAINT "FK_89b0937afafa70c018cb63656b8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "address" ALTER COLUMN "networkId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_cb5331f3042e3aca95345d4268d" FOREIGN KEY ("networkId") REFERENCES "network"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "buyerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_20981b2b68bf03393c44dd1b9d7" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ALTER COLUMN "orderId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sale_item" ALTER COLUMN "publishedById" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sale_item" ALTER COLUMN "nftId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_eae4a28bf50e4554d81e15b102f" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_b0f3894ec74339c2c9a0ae1aa97" FOREIGN KEY ("publishedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item" ADD CONSTRAINT "FK_d9533c4e6c49b31d6b76d0e5fcc" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "nftType" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "ownerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ALTER COLUMN "collectionId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_6c7967d2df644874a310f312511" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft" ADD CONSTRAINT "FK_941622072386aeece5112fe0db2" FOREIGN KEY ("collectionId") REFERENCES "nft_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "creatorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ALTER COLUMN "categoryId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD CONSTRAINT "FK_be0238a486437e8176bb3da6c06" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD CONSTRAINT "FK_60d00b6f0b3a0803930b5258078" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_property" ALTER COLUMN "nftId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "nft_property" ADD CONSTRAINT "FK_9e9051f3c2ba31e332e60275fde" FOREIGN KEY ("nftId") REFERENCES "nft"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "reddit_url"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "youtube_url"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "discord_url"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "instagram_url"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "telegram_url"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "github_url"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "twitter_url"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "facebook_url"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "website_url"`);
        await queryRunner.query(`ALTER TABLE "nft_collection" DROP COLUMN "nftUrls"`);
    }

}
