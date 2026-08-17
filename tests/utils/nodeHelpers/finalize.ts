import type { Address } from 'viem';

import { WithdrawalQueueContract } from '@tests/contracts';
import { getRoleSigner, getRoleAddress } from '@tests/testData';
import type { EthereumNodeService } from '@lidofinance/wallets-testing-nodes';

/**
 * Finalizes pending withdrawal requests as the nodeOperator account, which
 * Factory.createPoolFinish auto-grants FINALIZE_ROLE on the WithdrawalQueue
 * (see docs/context/contracts.md). This is never a UI action — production
 * finalization runs as an off-chain job — so the happy-path spec calls this
 * directly instead of the widget.
 */
export const finalizeWithdrawals = async (
  nodeService: EthereumNodeService,
  withdrawalQueueAddress: Address,
  maxRequests = 100n,
) => {
  const nodeOperator = getRoleSigner(nodeService, 'nodeOperator');

  await new WithdrawalQueueContract(withdrawalQueueAddress).finalize(
    maxRequests,
    getRoleAddress(nodeService, 'nodeOperator'),
    nodeOperator,
  );
};
