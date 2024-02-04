import { privateKeyToSafeSmartAccount } from "permissionless/accounts";
import type { Address, Hex } from "viem";
import { createPublicClient, createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { base } from "viem/chains";

import erc20Abi from "@/assets/abi/erc20";
import zoraErc1155Abi from "@/assets/abi/zoraErc1155";
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import { pimlicoPaymasterActions } from "permissionless/actions/pimlico";
import { createSmartAccountClient } from "permissionless";

type FidResponse = {
  verifications: string[];
};

interface FrameRequestBody {
  trustedData?: {
    messageBytes?: string;
  };
  untrustedData: {
    fid: number;
    buttonIndex: number;
    castId: { fid: number; hash: string };
  };
}

interface FarcasterUserReactions {
  reactions: {
    reaction_type: "recast";
    cast: {
      hash: string;
    };
  }[];
}

interface FarcasterUsers {
  users: {
    active_status: "active" | "inactive";
  }[];
}

interface WarpcastProfile {
  result:
    | {
        user: {
          fid: number;
          username: string | undefined;
          pfp:
            | {
                url: string | undefined;
              }
            | undefined;
          displayName: string | undefined;
          activeOnFcNetwork: boolean;
        };
      }
    | undefined;
}

const chain = base;

async function getAccountAddress(
  neynarApiKey: string,
  fid: number
): Promise<Address | null> {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    { headers: { accept: "application/json", api_key: neynarApiKey } }
  );
  const responseBody = await response.json();
  // Get the user verifications from the response
  if (responseBody.users) {
    const userVerifications = responseBody.users[0] as FidResponse;
    if (userVerifications.verifications) {
      return userVerifications.verifications[0] as Address;
    }
  }
  return null;
}

async function isActive(neynarApiKey: string, fid: number): Promise<boolean> {
  const params: URLSearchParams = new URLSearchParams({
    fids: [fid].toString(),
  });
  const endpoint = "https://api.neynar.com/v2/farcaster/user/bulk";
  const url = new URL(endpoint);
  url.search = params.toString();
  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      api_key: neynarApiKey,
    },
  });
  const responseBody = (await response.json()) as FarcasterUsers;
  if (responseBody.users) {
    const user = responseBody.users[0];
    if (user.active_status === "active") {
      return true;
    }
  }
  return false;
}

async function isRecasted(
  neynarApiKey: string,
  fid: number,
  castHash: string
): Promise<boolean> {
  // TODO paginate through all recasts
  const params: URLSearchParams = new URLSearchParams({
    fid: fid.toString(),
    type: "recasts",
    limit: "100",
  });
  const endpoint = "https://api.neynar.com/v2/farcaster/reactions/user";
  const url = new URL(endpoint);
  url.search = params.toString();
  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      api_key: neynarApiKey,
    },
  });
  const responseBody = (await response.json()) as FarcasterUserReactions;
  if (responseBody.reactions) {
    const recasts = responseBody.reactions.filter(
      (reaction) => reaction.reaction_type === "recast"
    );
    const recasted = recasts.some((recast) => recast.cast?.hash === castHash);
    if (!recasted) {
      console.log("No matching recast found");
    }
    return recasted;
  }
  console.log("No recasts found");
  return false;
}

async function getWalletAddress(
  privateKey: Hex,
  fid: number
): Promise<Address> {
  const publicClient = createPublicClient({
    transport: http(chain.rpcUrls.default.http[0]),
  });
  const safeAccount = await privateKeyToSafeSmartAccount(publicClient, {
    privateKey: privateKey,
    safeVersion: "1.4.1",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    saltNonce: BigInt(fid),
  });
  return safeAccount.address;
}

async function getNftBalance(
  owner: Address,
  token: Address,
  tokenId: number
): Promise<bigint> {
  const publicClient = createPublicClient({
    transport: http(chain.rpcUrls.default.http[0]),
  });
  const balance = await publicClient.readContract({
    address: token,
    abi: zoraErc1155Abi,
    functionName: "balanceOf",
    args: [owner, BigInt(tokenId)],
  });
  return balance;
}

async function getTokenBalance(
  owner: Address,
  token: Address
): Promise<bigint> {
  const publicClient = createPublicClient({
    transport: http(chain.rpcUrls.default.http[0]),
  });
  const balance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner],
  });
  return balance;
}

async function transferToken(
  adminMnemonic: string,
  token: Address,
  owner: Address,
  amount: bigint
): Promise<string | null> {
  const publicClient = createPublicClient({
    transport: http(chain.rpcUrls.default.http[0]),
  });
  const walletClient = createWalletClient({
    chain: chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
  try {
    const { request } = await publicClient.simulateContract({
      address: token,
      abi: erc20Abi,
      functionName: "transfer",
      args: [owner, amount],
      account: mnemonicToAccount(adminMnemonic),
    });
    if (!request) {
      return null;
    }
    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (e) {
    console.error("Send error", e);
    return null;
  }
}

async function zoraAdminMint(
  adminMnemonic: string,
  contractAddress: Address,
  tokenId: number,
  address: Address
): Promise<string | null> {
  const publicClient = createPublicClient({
    transport: http(chain.rpcUrls.default.http[0]),
  });
  const walletClient = createWalletClient({
    chain: chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
  try {
    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: zoraErc1155Abi,
      functionName: "adminMint",
      args: [address, BigInt(tokenId), BigInt(1), "0x"],
      account: mnemonicToAccount(adminMnemonic),
    });
    if (!request) {
      return null;
    }
    const hash = await walletClient.writeContract(request);
    return hash;
  } catch (e) {
    console.error("Mint error", e);
    return null;
  }
}

async function getWarpcastProfile(username: string): Promise<WarpcastProfile> {
  const warpcastProfileResponse = await fetch(
    `https://api.warpcast.com/v2/user-by-username?username=${username}`
  );
  const profile = (await warpcastProfileResponse.json()) as WarpcastProfile;
  return profile;
}

async function execute(
  pimlicoApiKey: string,
  privateKey: Hex,
  fid: number,
  to: Address,
  data: Hex,
  value: bigint,
  sponsorshipPolicyId?: string
): Promise<string | null> {
  const chainName = chain.name.toLowerCase();

  const publicClient = createPublicClient({
    transport: http(chain.rpcUrls.default.http[0]),
  });

  const paymasterClient = createPimlicoPaymasterClient({
    transport: http(
      `https://api.pimlico.io/v2/${chainName}/rpc?apikey=${pimlicoApiKey}`
    ),
  }).extend(pimlicoPaymasterActions);

  const bundlerClient = createPimlicoBundlerClient({
    transport: http(
      `https://api.pimlico.io/v1/${chainName}/rpc?apikey=${pimlicoApiKey}`
    ),
  });

  const gasPrices = await bundlerClient.getUserOperationGasPrice();

  const safeAccount = await privateKeyToSafeSmartAccount(publicClient, {
    privateKey: privateKey,
    safeVersion: "1.4.1",
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    saltNonce: BigInt(fid),
  });

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    chain: chain,
    transport: http(
      `https://api.pimlico.io/v1/${chainName}/rpc?apikey=${pimlicoApiKey}`
    ),
    sponsorUserOperation: async (args) => {
      const response = await paymasterClient.sponsorUserOperation({
        userOperation: args.userOperation,
        entryPoint: args.entryPoint,
        sponsorshipPolicyId: sponsorshipPolicyId || "sp_base_frame",
      });
      return response;
    },
  });

  try {
    const txHash = await smartAccountClient.sendTransaction({
      to,
      data,
      value,
      maxFeePerGas: gasPrices.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas,
    });

    return txHash;
  } catch {
    return null;
  }
}

function getErc20TransferData(to: string, amount: bigint): Hex {
  const selector = "0xa9059cbb";
  const paddedAddress = to.slice(2).padStart(64, "0");
  const paddedAmount = amount.toString(16).padStart(64, "0");
  return (selector + paddedAddress + paddedAmount) as Hex;
}

export {
  getAccountAddress,
  getWalletAddress,
  isActive,
  isRecasted,
  getNftBalance,
  getTokenBalance,
  transferToken,
  zoraAdminMint,
  getWarpcastProfile,
  getErc20TransferData,
  execute,
};
export type { FrameRequestBody };
