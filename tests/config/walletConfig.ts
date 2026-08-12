import {
  METAMASK_STABLE_COMMON_CONFIG,
  OKX_COMMON_CONFIG,
  WC_SDK_COMMON_CONFIG,
  type CommonWalletConfig,
} from '@lidofinance/wallets-testing-wallets';

export const getWalletConfigByName = (
  walletName: string,
): CommonWalletConfig => {
  switch (walletName) {
    case 'metamask':
      return METAMASK_STABLE_COMMON_CONFIG;
    case 'okx':
      return OKX_COMMON_CONFIG;
    case 'walletconnect':
      return WC_SDK_COMMON_CONFIG;
    default:
      throw new Error(`Unsupported WALLET_NAME: ${walletName}`);
  }
};
