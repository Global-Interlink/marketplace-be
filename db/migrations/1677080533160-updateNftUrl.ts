import { MigrationInterface, QueryRunner } from "typeorm";

export class updateNftUrl1677080533160 implements MigrationInterface {
    name = 'updateNftUrl1677080533160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "nftUrls" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "website_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "facebook_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "twitter_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "github_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "telegram_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "instagram_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "discord_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "youtube_url" character varying`);
        await queryRunner.query(`ALTER TABLE "nft_collection" ADD "reddit_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
