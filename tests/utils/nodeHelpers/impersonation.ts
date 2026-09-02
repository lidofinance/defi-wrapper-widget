import type { Address } from 'viem';

import { getPublicClient, getTestClient } from '@tests/providers';

import { IMPERSONATION_BALANCE, MIN_GAS_AMOUNT_BALANCE } from './consts';

/**
 * Tops up `address`'s balance if it's below gas dust. Call before
 * `testClient.impersonateAccount` so impersonated txs can pay gas.
 */
export const ensureFunded = async (address: Address) => {
  const currentBalance = await getPublicClient().getBalance({ address });
  if (currentBalance < MIN_GAS_AMOUNT_BALANCE) {
    await getTestClient().setBalance({ address, value: IMPERSONATION_BALANCE });
  }
};
