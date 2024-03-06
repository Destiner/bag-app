import {
  PaymasterMode,
  createPaymaster as createBiconomyPaymaster,
} from "@biconomy/account";
import {
  privateKeyToSafeSmartAccount,
  signerToSafeSmartAccount,
} from "permissionless/accounts";
import {
  pimlicoBundlerActions,
  pimlicoPaymasterActions,
} from "permissionless/actions/pimlico";
import {
  ENTRYPOINT_ADDRESS_V06,
  bundlerActions,
  createSmartAccountClient,
} from "permissionless";
import type { Address, Hex } from "viem";
import {
  createClient,
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { mnemonicToAccount, privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import erc20Abi from "@/assets/abi/erc20";
import zoraErc1155Abi from "@/assets/abi/zoraErc1155Minter";

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

async function getGasPrices(pimlicoApiKey: string) {
  const chainName = chain.name.toLowerCase();
  const pimlicoBundlerClient = createClient({
    chain,
    transport: http(
      `https://api.pimlico.io/v2/${chainName}/rpc?apikey=${pimlicoApiKey}`
    ),
  })
    .extend(bundlerActions(ENTRYPOINT_ADDRESS_V06))
    .extend(pimlicoBundlerActions(ENTRYPOINT_ADDRESS_V06));
  const gasPrices = await pimlicoBundlerClient.getUserOperationGasPrice();
  return gasPrices;
}

async function getSmartAccountClient(
  pimlicoApiKey: string,
  privateKey: Hex,
  fid: number
) {
  const chainName = base.name.toLowerCase();
  const publicClient = createPublicClient({
    transport: http(chain.rpcUrls.default.http[0]),
  });

  const signer = privateKeyToAccount(privateKey);

  const safeAccount = await signerToSafeSmartAccount(publicClient, {
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    signer: signer,
    safeVersion: "1.4.1",
    saltNonce: BigInt(fid),
  });

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    chain: base,
    bundlerTransport: http(
      `https://api.pimlico.io/v2/${chainName}/rpc?apikey=${pimlicoApiKey}`
    ),
  });

  return smartAccountClient;
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
  const smartAccountClient = await getSmartAccountClient(
    pimlicoApiKey,
    privateKey,
    fid
  );
  const gasPrices = await getGasPrices(pimlicoApiKey);
  try {
    const txHash = await smartAccountClient.sendTransaction({
      to,
      data,
      value,
      maxFeePerGas: gasPrices.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas,
    });

    return txHash;
  } catch (e) {
    console.error("Error executing tx", e);
    return null;
  }
}

async function multiExecute(
  pimlicoApiKey: string,
  privateKey: Hex,
  fid: number,
  transactions: {
    to: Address;
    data: Hex;
    value: bigint;
  }[]
): Promise<string | null> {
  const smartAccountClient = await getSmartAccountClient(
    pimlicoApiKey,
    privateKey,
    fid
  );
  const gasPrices = await getGasPrices(pimlicoApiKey);
  try {
    const txHash = await smartAccountClient.sendTransactions({
      transactions,
      maxFeePerGas: gasPrices.fast.maxFeePerGas,
      maxPriorityFeePerGas: gasPrices.fast.maxPriorityFeePerGas,
    });

    return txHash;
  } catch (e) {
    console.error("Error executing tx", e);
    return null;
  }
}

async function multiExecuteBiconomy(
  biconomyPaymasterApi: string,
  pimlicoApiKey: string,
  privateKey: Hex,
  fid: number,
  transactions: {
    to: Address;
    data: Hex;
    value: bigint;
  }[]
) {
  const chainName = base.name.toLowerCase();
  const publicClient = createPublicClient({
    transport: http(chain.rpcUrls.default.http[0]),
  });

  const signer = privateKeyToAccount(privateKey);

  const safeAccount = await signerToSafeSmartAccount(publicClient, {
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    signer: signer,
    safeVersion: "1.4.1",
    saltNonce: BigInt(fid),
  });

  const bundlerClient = createClient({
    chain: base,
    transport: http(
      `https://api.pimlico.io/v2/${chainName}/rpc?apikey=${pimlicoApiKey}`
    ),
  })
    .extend(bundlerActions(ENTRYPOINT_ADDRESS_V06))
    .extend(pimlicoBundlerActions(ENTRYPOINT_ADDRESS_V06));

  console.log("Execute with Biconomy 1: bundler client");

  const biconomyPaymasterClient = createPublicClient({
    transport: http(biconomyPaymasterApi),
  }).extend(pimlicoPaymasterActions(ENTRYPOINT_ADDRESS_V06));

  console.log("Execute with Biconomy 2: paymaster client");

  const biconomyPaymaster = await createBiconomyPaymaster({
    paymasterUrl: biconomyPaymasterApi,
  });

  console.log("Execute with Biconomy 3: smart account client");

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    chain: base,
    bundlerTransport: http(
      `https://api.pimlico.io/v2/${chainName}/rpc?apikey=${pimlicoApiKey}`
    ),
    middleware: {
      gasPrice: async () => {
        console.log("Execute with Biconomy 5: gas price");
        return (await bundlerClient.getUserOperationGasPrice()).fast;
      },
      sponsorUserOperation: async ({ userOperation, entryPoint }) => {
        console.log("Execute with Biconomy 6: paymaster sponsorship");
        if (entryPoint === ENTRYPOINT_ADDRESS_V06) {
          const paymasterAndData = await biconomyPaymaster.getPaymasterAndData(
            {
              sender: userOperation.sender,
              nonce: `0x${userOperation.nonce.toString(16)}`,
              initCode: userOperation.initCode,
              callData: userOperation.callData,
              callGasLimit: `0x${userOperation.callGasLimit.toString(16)}`,
              verificationGasLimit: `0x${userOperation.verificationGasLimit.toString(
                16
              )}`,
              preVerificationGas: `0x${userOperation.preVerificationGas.toString(
                16
              )}`,
              maxFeePerGas: `0x${userOperation.maxFeePerGas.toString(16)}`,
              maxPriorityFeePerGas: `0x${userOperation.maxPriorityFeePerGas.toString(
                16
              )}`,
              paymasterAndData: userOperation.paymasterAndData,
              signature: userOperation.signature,
            },
            {
              mode: PaymasterMode.SPONSORED,
            }
          );
          return {
            callGasLimit: BigInt(paymasterAndData.callGasLimit),
            verificationGasLimit: BigInt(paymasterAndData.verificationGasLimit),
            preVerificationGas: BigInt(paymasterAndData.preVerificationGas),
            paymasterAndData: paymasterAndData.paymasterAndData,
          };
        } else {
          return {
            callGasLimit: userOperation.callGasLimit,
            verificationGasLimit: userOperation.verificationGasLimit,
            preVerificationGas: userOperation.preVerificationGas,
            paymasterAndData: userOperation.paymasterAndData,
          };
        }
      },
    },
  });

  console.log("Execute with Biconomy 4: send transactions");
  const txHash = await smartAccountClient.sendTransactions({
    transactions,
  });
  return txHash;
}

function getErc20TransferData(to: string, amount: bigint): Hex {
  const selector = "0xa9059cbb";
  const paddedAddress = to.slice(2).padStart(64, "0");
  const paddedAmount = amount.toString(16).padStart(64, "0");
  return (selector + paddedAddress + paddedAmount) as Hex;
}

function getErrorImageUrl(baseUrl: string, reason: string | undefined): string {
  const imageParams: Record<string, string> = {};
  if (reason) {
    imageParams.reason = reason;
  }
  const urlParams = new URLSearchParams(imageParams);
  const imageUrl = new URL(`${baseUrl}/api/frame/image-error`);
  imageUrl.search = urlParams.toString();
  return imageUrl.toString();
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
  multiExecute,
  getErrorImageUrl,
  multiExecuteBiconomy,
};
export type { FrameRequestBody };
