import { z } from "zod";

export interface Provider {
  provider: string;
  chain: string;
  network: string;
}

export interface ChainNetwork {
  chain: string;
  network: string;
  providers: Provider[];
}

export const liveQueryProviderTypeSchema = z.union([z.literal("google"), z.literal("quicknode")]);

export type LiveQueryProviderType = z.infer<typeof liveQueryProviderTypeSchema>;

export function getCanonicalChainNetworkByProvider(
  provider: string,
  chain: string,
  network: string
): ChainNetwork | undefined {
  return providerMap.find((chainNetwork: ChainNetwork) => {
    return chainNetwork.providers.some((providerObj: Provider) => {
      return providerObj.provider === provider && providerObj.chain === chain && providerObj.network === network;
    });
  });
}

export function getProviderByCanonicalChainNetwork(
  provider: string,
  chain: string,
  network: string
): Provider | undefined {
  for (const chainNetwork of providerMap) {
    if (chainNetwork.chain === chain && chainNetwork.network === network) {
      // iterate over the providers array
      for (const providerObj of chainNetwork.providers) {
        // if the current provider object matches the provided provider
        if (providerObj.provider === provider) {
          return providerObj;
        }
      }
    }
  }
}

export const providerMap: ChainNetwork[] = [
  {
    chain: "algorand",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "algorand",
        network: "algorand-mainnet",
      },
    ],
  },
  {
    chain: "algorand",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "algorand",
        network: "algorand-testnet",
      },
    ],
  },
  {
    chain: "algorand",
    network: "betanet",
    providers: [
      {
        provider: "quicknode",
        chain: "algorand",
        network: "algorand-betanet",
      },
    ],
  },
  {
    chain: "aptos",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "aptos",
        network: "aptos-mainnet",
      },
    ],
  },
  {
    chain: "aptos",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "aptos",
        network: "aptos-testnet",
      },
    ],
  },
  {
    chain: "arbitrum_nova",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "arbitrum-nova",
        network: "nova-mainnet",
      },
    ],
  },
  {
    chain: "arbitrum_one",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "arbitrum",
        network: "arbitrum-mainnet",
      },
    ],
  },
  {
    chain: "arbitrum_one",
    network: "goerli",
    providers: [
      {
        provider: "quicknode",
        chain: "arbitrum",
        network: "arbitrum-goerli",
      },
    ],
  },
  {
    chain: "arbitrum_one",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "arbitrum",
        network: "arbitrum-testnet",
      },
    ],
  },
  {
    chain: "avalanche",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "avalanche",
        network: "avalanche-mainnet",
      },
    ],
  },
  {
    chain: "avalanche",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "avalanche",
        network: "avalanche-testnet",
      },
    ],
  },
  {
    chain: "bitcoin",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "bitcoin",
        network: "btc",
      },
    ],
  },
  {
    chain: "bitcoin",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "bitcoin",
        network: "btc-testnet",
      },
    ],
  },
  {
    chain: "bsc",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "bnb-smart-chain",
        network: "bsc",
      },
    ],
  },
  {
    chain: "bsc",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "bnb-smart-chain",
        network: "bsc-testnet",
      },
    ],
  },
  {
    chain: "celo",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "celo",
        network: "celo-mainnet",
      },
    ],
  },
  {
    chain: "ethereum",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "ethereum",
        network: "mainnet",
      },
    ],
  },
  {
    chain: "ethereum",
    network: "rinkeby",
    providers: [
      {
        provider: "quicknode",
        chain: "ethereum",
        network: "rinkeby",
      },
    ],
  },
  {
    chain: "ethereum",
    network: "ropsten",
    providers: [
      {
        provider: "quicknode",
        chain: "ethereum",
        network: "ropsten",
      },
    ],
  },
  {
    chain: "ethereum",
    network: "goerli",
    providers: [
      {
        provider: "quicknode",
        chain: "ethereum",
        network: "ethereum-goerli",
      },
    ],
  },
  {
    chain: "ethereum",
    network: "kovan",
    providers: [
      {
        provider: "quicknode",
        chain: "ethereum",
        network: "kovan",
      },
    ],
  },
  {
    chain: "fantom",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "fantom",
        network: "fantom",
      },
    ],
  },
  {
    chain: "gnosis",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "gnosis",
        network: "xdai",
      },
    ],
  },
  {
    chain: "gnosis",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "gnosis",
        network: "xdai",
      },
    ],
  },
  {
    chain: "harmony",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "harmony",
        network: "harmony-mainnet",
      },
    ],
  },
  {
    chain: "harmony",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "harmony",
        network: "harmony-testnet",
      },
    ],
  },
  {
    chain: "near",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "near",
        network: "near-mainnet",
      },
    ],
  },
  {
    chain: "near",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "near",
        network: "near-testnet",
      },
    ],
  },
  {
    chain: "optimism",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "optimistic-ethereum",
        network: "optimism",
      },
    ],
  },
  {
    chain: "optimism",
    network: "goerli",
    providers: [
      {
        provider: "quicknode",
        chain: "optimistic-ethereum",
        network: "optimism-goerli",
      },
    ],
  },
  {
    chain: "optimism",
    network: "kovan",
    providers: [
      {
        provider: "quicknode",
        chain: "optimistic-ethereum",
        network: "optimism-kovan",
      },
    ],
  },
  {
    chain: "palm",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "palm",
        network: "palm-mainnet",
      },
    ],
  },
  {
    chain: "palm",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "palm",
        network: "palm-testnet",
      },
    ],
  },
  {
    chain: "polygon",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "polygon",
        network: "matic",
      },
    ],
  },
  {
    chain: "polygon",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "polygon",
        network: "matic-testnet",
      },
    ],
  },
  {
    chain: "polygon_zkevm",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "polygon-zkevm",
        network: "zkevm-mainnet",
      },
    ],
  },
  {
    chain: "polygon_zkevm",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "polygon-zkevm",
        network: "zkevm-testnet",
      },
    ],
  },
  {
    chain: "solana",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "solana",
        network: "solana-mainnet",
      },
    ],
  },
  {
    chain: "solana",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "solana",
        network: "solana-testnet",
      },
    ],
  },
  {
    chain: "solana",
    network: "devnet",
    providers: [
      {
        provider: "quicknode",
        chain: "solana",
        network: "solana-devnet",
      },
    ],
  },
  {
    chain: "stacks",
    network: "mainnet",
    providers: [
      {
        provider: "quicknode",
        chain: "stacks",
        network: "stacks-mainnet",
      },
    ],
  },
  {
    chain: "stacks",
    network: "testnet",
    providers: [
      {
        provider: "quicknode",
        chain: "stacks",
        network: "stacks-testnet",
      },
    ],
  },
];
