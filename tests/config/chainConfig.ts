import type { Address, Chain } from 'viem';
import {
  NETWORKS_CONFIG,
  type NetworkConfig,
} from '@lidofinance/wallets-testing-wallets';
import { hoodi, mainnet } from 'viem/chains';

// Per-chain deployments and local Anvil settings.
export const HOODI_CHAIN_ID = 560048;
export const MAINNET_CHAIN_ID = 1;

export type SupportedChainId = typeof HOODI_CHAIN_ID | typeof MAINNET_CHAIN_ID;

export type MellowConfig = {
  strategyFactory: Address;
  vault: Address;
  asyncRedeemQueue: Address;
  oracle: Address;
};

export type ChainConfig = {
  factoryAddress: Address;
  lidoLocatorAddress: Address;
  wstethAddress: Address;
  wstethReferralStakerAddress: Address;
  mellow: MellowConfig;
  networkConfig: NetworkConfig;
  nodeConfig: { host: string; port: number };
};

const CHAIN_CONFIGS: Record<SupportedChainId, ChainConfig> = {
  [HOODI_CHAIN_ID]: {
    factoryAddress: '0xd05ebF24A340ece8B8FB53a170F1171DCd02b4d9',
    lidoLocatorAddress: '0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8',
    wstethAddress: '0x7E99eE3C66636DE415D2d7C880938F2f40f94De4',
    wstethReferralStakerAddress: '0xf886BcC68b240316103fE8A12453Ce7831c2e835',
    mellow: {
      // Source: vaults-wrapper/deployments/pool-factory-hoodi.json.
      strategyFactory: '0x0b860bfFDA72D214Dc8aC98bEcd8D1cd55307561',
      vault: '0x006029e2228D784572CcF31d4b791a48d0F3C75D',
      asyncRedeemQueue: '0x6491b91adfa0762e04e950a16b37627d57c00cc5',
      oracle: '0x7a4d8c0643d1f51d2b450e6ccfecf5a9290cab8f',
    },
    networkConfig: {
      ...NETWORKS_CONFIG.testnet.ETHEREUM_HOODI,
      rpcUrl: process.env.RPC_URL
        ? process.env.RPC_URL
        : NETWORKS_CONFIG.testnet.ETHEREUM_HOODI.rpcUrl,
    },
    nodeConfig: { host: '127.0.0.1', port: 8045 },
  },
  [MAINNET_CHAIN_ID]: {
    factoryAddress: '0x3f221b8E5bC098cC6C23611BEeacaeCfD77e1587',
    lidoLocatorAddress: '0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb',
    wstethAddress: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    wstethReferralStakerAddress: '0xa88f0329C2c4ce51ba3fc619BBf44efE7120Dd0d',
    mellow: {
      strategyFactory: '0x8Fac09FD82F031D390B94622E2E4baBf16Fd2236',
      vault: '0x6a37725ca7f4CE81c004c955f7280d5C704a249e',
      asyncRedeemQueue: '0x095bFAca9f1c6F2B063Cd67C6d6bfcd0c3aaB7b4',
      oracle: '0xAda1f4c24603aB2fe5aBd35BCD12370e98A20358',
    },
    networkConfig: {
      ...NETWORKS_CONFIG.mainnet.ETHEREUM,
      rpcUrl: process.env.RPC_URL
        ? process.env.RPC_URL
        : NETWORKS_CONFIG.mainnet.ETHEREUM.rpcUrl,
    },
    nodeConfig: { host: '127.0.0.1', port: 8545 },
  },
};

export const getChainConfig = (): ChainConfig => {
  const raw = process.env.CHAIN_ID;
  if (!raw) {
    throw new Error(
      `CHAIN_ID is not set. Set it explicitly in tests/.env (${Object.keys(CHAIN_CONFIGS).join(', ')}) — there is no default stand.`,
    );
  }

  const config = CHAIN_CONFIGS[Number(raw) as SupportedChainId];
  if (!config) {
    throw new Error(
      `CHAIN_ID=${raw} is not a supported chain (${Object.keys(CHAIN_CONFIGS).join(', ')}).`,
    );
  }
  return config;
};

export const getNodeUrl = (): string => {
  const { host, port } = getChainConfig().nodeConfig;
  return `http://${host}:${port}`;
};

const SUPPORTED_VIEM_CHAINS: Chain[] = [hoodi, mainnet];

export const getViemChain = (): Chain => {
  const chainId = getChainConfig().networkConfig.chainId;
  const chain = SUPPORTED_VIEM_CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(`Chain ${chainId} is not supported`);
  }
  return chain;
};
