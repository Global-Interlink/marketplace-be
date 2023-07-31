import { NftPropertyType } from "../resources/nft_property/nft_property.type";

export class NFTDto {
  name: string;
  description?: string;
  url: string;
  objectId: string;
  owner: string;
  nftType: string;
  kioskId: string;
  kioskOwnerCapId: string;
  properties: NftPropertyType[];
}
