import type { Address } from 'viem';

import { AllowListContract } from '../../contracts/allow-list.contract';
import { getTestClient } from '../../providers';
import { ensureFunded } from './impersonation';

/**
 * Adds `account` to `contractAddress`'s allowlist (src/AllowList.sol),
 * impersonating `timelock`. MellowStrategy grants ALLOW_LIST_MANAGER_ROLE to
 * its timelock during initialization, so test depositors can be allow-listed
 * without running the real timelock propose/wait/execute flow.
 */
export const addToAllowListViaImpersonation = async (
  contractAddress: Address,
  account: Address,
  timelock: Address,
) => {
  const testClient = getTestClient();

  await ensureFunded(timelock);
  await testClient.impersonateAccount({ address: timelock });

  await new AllowListContract(contractAddress).add(account, timelock);

  await testClient.stopImpersonatingAccount({ address: timelock });
};
