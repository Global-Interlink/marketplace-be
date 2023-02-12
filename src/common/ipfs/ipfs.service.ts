import { Injectable } from '@nestjs/common';
import { create } from 'ipfs-http-client';
import { fromString } from 'uint8arrays/from-string'
@Injectable()
export class IpfsService {
  async createConnect() {
    const auth =
      'Basic ' +
      Buffer.from(
        process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_SERECT_KEY,
        'utf8',
      ).toString('base64');
    return create({
      host: process.env.IPFS_HOST,
      port: Number(process.env.IPFS_PORT),
      protocol: 'https',
      apiPath: process.env.IPFS_API_PATH,
      headers: { authorization: auth },
    });
  }

  /**
   *
   * @param input String base64
   * @returns url
   */
  async upload(input: string): Promise<String> {
    const client = await this.createConnect();
    const data = fromString(input, 'base64')
    const result = await client.add(data);
    return process.env.IPFS_BASE_URL + result.path;
  }

  /**
   *
   * @param files: String[] base64
   * @returns urls[]
   */
   async uploadMultiples(files: string[]): Promise<String[]> {
    const client = await this.createConnect();
    let results = [];
    for (let i = 0; i < files.length; i++) {
      const data = fromString(files[i], 'base64')
      const result = await client.add(data);
      results.push(process.env.IPFS_BASE_URL + result.path);
    }
    return results;
  }
}