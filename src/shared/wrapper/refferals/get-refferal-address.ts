import { Address, Chain, getAddress, isAddress, zeroAddress } from 'viem';
import { getEnsAddress, normalize } from 'viem/ens';
import { USER_CONFIG } from '@/config';
import type { RegisteredPublicClient } from '@/modules/web3';

export const getReferralAddress = async (
  input: string | null,
  provider: RegisteredPublicClient,
): Promise<Address> => {
  try {
    const fallback = USER_CONFIG.defaultReferralAddress || zeroAddress;

    if (!input) return fallback;

    // The address is Ethereum address
    if (isAddress(input)) return getAddress(input);

    // Not all ENS names end with .eth, so we can't detect ENS names easily.
    // The address is a http[s] link, return fallback instead
    if (/^https?:\/\//.test(input)) return fallback;
    // Filter out *.lido.fi referrals, e.g. ref from blog.lido.fi
    // Assuming, that no one uses the 'lido.fi' ENS name
    if (input.endsWith('lido.fi')) return fallback;

    const { contracts } = provider.chain as Chain;
    if (!contracts?.ensUniversalResolver) {
      return fallback;
    }

    // Trying to get ENS address takes some time, so it is called after another checks
    const ensAddress = await getEnsAddress<Chain>(provider, {
      name: normalize(input),
    });
    if (ensAddress) return getAddress(ensAddress);

    // the provided 'input' is not an Ethereum address, nor a ENS address, returning the fallback
    return fallback;
  } catch (error) {
    console.warn('getReferralAddress error:', error);
    // something went wrong during getting the address
    throw new ReferralAddressError();
  }
};

class ReferralAddressError extends Error {
  reason: string;

  constructor() {
    const message = 'execution reverted: INVALID_REFERRAL';
    super(message);
    this.reason = message;
  }
}
