import { JsonRpcClient, JsonRpcProvider, devnetConnection } from "@mysten/sui.js";

export const getRPCConnection = () => {
  // const mode = process.env.NEXT_PUBLIC_RPC_CONNECTION;
  return new JsonRpcProvider(undefined, {
      rpcClient: new JsonRpcClient(process.env.BLOCKCHAIN_NETWORK_ENV),
    });

  // if (mode === "TESTNET") {
  //   return new JsonRpcProvider(undefined, {
  //     rpcClient: new JsonRpcClient("https://sui-fullnode-testnet.gil.eco/"),
  //   });
  // }
  // if (mode === "MAINNET") {
  //   return new JsonRpcProvider(devnetConnection); // temp
  // }
  // return new JsonRpcProvider(devnetConnection);
};
