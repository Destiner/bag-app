import { privateKeyToSafeSmartAccount } from "permissionless/accounts";
import type { Address, Hex } from "viem";
import { createPublicClient, createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { base } from "viem/chains";

import erc20Abi from "@/assets/abi/erc20";
import zoraErc1155Abi from "@/assets/abi/zoraErc1155";

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
    transport: http("https://mainnet.base.org"),
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
    transport: http("https://mainnet.base.org"),
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
    transport: http("https://mainnet.base.org"),
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
    transport: http("https://mainnet.base.org"),
  });
  const walletClient = createWalletClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
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
    transport: http("https://mainnet.base.org"),
  });
  const walletClient = createWalletClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
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

export {
  getAccountAddress,
  getWalletAddress,
  isActive,
  isRecasted,
  getNftBalance,
  getTokenBalance,
  transferToken,
  zoraAdminMint,
};
export type { FrameRequestBody };
