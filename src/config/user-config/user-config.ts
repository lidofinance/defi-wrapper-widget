import { type Address, isAddress } from 'viem';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import { type DefiWrapperTypes } from '@/modules/defi-wrapper';

export type UserConfigDefaultType = {
  defaultChain: number;
  supportedChainIds: number[];
  publicElRpcUrls: Record<CHAINS, string[]>;
  walletconnectProjectId: string | undefined;
  devnetOverrides: string;
  defaultReferralAddress: Address | undefined;
  LOCALE: string;
  poolAddress: Address;
  poolType: DefiWrapperTypes;
  strategyAddress?: Address;
  isDev: boolean;
  widgetTitle?: string;
};

const assertAddress = (value: unknown, envLabel?: string): Address => {
  if (typeof value !== 'string' || !isAddress(value.toLowerCase())) {
    throw new Error(`Invalid address values (${envLabel}): ${value}`);
  }
  return value.toLowerCase() as Address;
};

const assertPoolType = (
  value: unknown,
  envLabel?: string,
): DefiWrapperTypes => {
  const validTypes: DefiWrapperTypes[] = [
    'StvPool',
    'StvStETHPool',
    'StvStrategyPool',
  ];

  const poolType = validTypes.find(
    (type) => type.toLowerCase() == String(value).toLowerCase(),
  );

  if (!poolType) {
    throw new Error(`Invalid wrapper type values (${envLabel}): ${value}`);
  }
  return poolType;
};

const supportedChains =
  import.meta.env.VITE_SUPPORTED_CHAINS?.split(',').map(Number) || [];

const supportedChainsWithMainnet = supportedChains.includes(CHAINS.Mainnet)
  ? [CHAINS.Mainnet, ...supportedChains]
  : supportedChains;

const poolType = assertPoolType(
  import.meta.env.VITE_POOL_TYPE,
  'VITE_POOL_TYPE',
);

export const USER_CONFIG: UserConfigDefaultType = {
  isDev: !!import.meta.env.DEV,
  widgetTitle: import.meta.env.VITE_WIDGET_TITLE,
  defaultChain: +import.meta.env.VITE_DEFAULT_CHAIN,
  supportedChainIds: supportedChains,
  walletconnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  devnetOverrides: import.meta.env.VITE_DEVNET_OVERRIDES,
  defaultReferralAddress:
    import.meta.env.VITE_DEFAULT_REFERRAL_ADDRESS === undefined ||
    import.meta.env.VITE_DEFAULT_REFERRAL_ADDRESS === ''
      ? undefined
      : assertAddress(
          import.meta.env.VITE_DEFAULT_REFERRAL_ADDRESS,
          'VITE_DEFAULT_REFERRAL_ADDRESS',
        ),
  publicElRpcUrls: supportedChainsWithMainnet.reduce(
    (acc: { [key: string]: string[] }, chain: number) => {
      acc[`${chain}`] =
        import.meta.env[`VITE_PUBLIC_EL_RPC_URLS_${chain}`]?.split(',') ?? [];
      return acc;
    },
    {},
  ) as UserConfigDefaultType['publicElRpcUrls'],
  LOCALE: import.meta.env.VITE_LOCALE || 'en-US',
  poolType,
  poolAddress: assertAddress(
    import.meta.env.VITE_POOL_ADDRESS,
    'VITE_POOL_ADDRESS',
  ),
  strategyAddress:
    poolType === 'StvStrategyPool'
      ? assertAddress(
          import.meta.env.VITE_STRATEGY_ADDRESS,
          'VITE_STRATEGY_ADDRESS',
        )
      : undefined,
};
