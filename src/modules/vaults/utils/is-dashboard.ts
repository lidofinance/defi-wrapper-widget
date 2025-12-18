import type { Address } from 'viem';
import type { RegisteredPublicClient } from '@/modules/web3';
import { getVaultFactoryContract } from '../contracts';

const PROXY_CODE_PAD_LEFT = '0x363d3d373d3d3d363d73';
const PROXY_CODE_PAD_RIGHT = '5af43d82803e903d91602b57fd5bf';

const IMPLEMENTATION_CACHE = new Map<string, string>();

const getProxyCodeWithCache = async (
  publicClient: RegisteredPublicClient,
): Promise<string> => {
  const factory = getVaultFactoryContract(publicClient);
  const key = factory.address.toLowerCase() + publicClient.chain.id;
  const cachedCode = IMPLEMENTATION_CACHE.get(key);
  if (cachedCode) {
    return cachedCode;
  }
  const implementation = await factory.read.DASHBOARD_IMPL();
  const proxyCode =
    PROXY_CODE_PAD_LEFT +
    implementation.slice(2).toLowerCase() +
    PROXY_CODE_PAD_RIGHT;
  IMPLEMENTATION_CACHE.set(key, proxyCode);
  return proxyCode;
};

export const isDashboard = async (
  publicClient: RegisteredPublicClient,
  dashboardAddress: Address,
): Promise<boolean> => {
  // TODO: return this check on mainnet when vault factory is stabilized
  return true;

  const [contractCode, canonicalCode] = await Promise.all([
    publicClient.getCode({ address: dashboardAddress }),
    getProxyCodeWithCache(publicClient),
  ]);

  return contractCode?.startsWith(canonicalCode) || false;
};
