import { encodeAbiParameters, parseEther, zeroHash } from 'viem';
import type { Account, Address } from 'viem';

import { getChainConfig } from '../../config/chainConfig';
import { AsyncRedeemQueueContract } from '../../contracts/async-redeem-queue.contract';
import { Erc20Contract } from '../../contracts/erc20.contract';
import { MellowOracleContract } from '../../contracts/mellow-oracle.contract';
import { MellowVaultContract } from '../../contracts/mellow-vault.contract';
import { WstethReferralStakerContract } from '../../contracts/wsteth-referral-staker.contract';
import { getPublicClient, getTestClient } from '../../providers';
import { ensureFunded } from './impersonation';

// Queue addresses are factory immutables; deployBytes contains only this flag.
export const encodeMellowDeployBytes = (
  allowListEnabled: boolean,
): `0x${string}` => encodeAbiParameters([{ type: 'bool' }], [allowListEnabled]);

// Mainnet intervals prevent back-to-back reports; price guards stay unchanged.
const ensureTrivialSecurityParams = async (oracle: Address, vault: Address) => {
  const testClient = getTestClient();
  const oracleContract = new MellowOracleContract(oracle);
  const vaultContract = new MellowVaultContract(vault);

  const current = await oracleContract.securityParams();
  if (
    current.timeout <= 1 &&
    current.depositInterval <= 1 &&
    current.redeemInterval <= 1
  ) {
    return;
  }

  const setSecurityParamsRole = await oracleContract.setSecurityParamsRole();
  const holderCount = await vaultContract.getRoleMemberCount(
    setSecurityParamsRole,
  );

  let roleHolder: Address;
  if (holderCount > 0n) {
    roleHolder = await vaultContract.getRoleMember(setSecurityParamsRole);
  } else {
    // Mainnet may have no role holder, so grant it through the default admin.
    const adminHolder = await vaultContract.getRoleMember(zeroHash);

    await ensureFunded(adminHolder);
    await testClient.impersonateAccount({ address: adminHolder });

    await vaultContract.grantRole(
      setSecurityParamsRole,
      adminHolder,
      adminHolder,
    );

    await testClient.stopImpersonatingAccount({ address: adminHolder });
    roleHolder = adminHolder;
  }

  await ensureFunded(roleHolder);
  await testClient.impersonateAccount({ address: roleHolder });

  await oracleContract.setSecurityParams(
    { ...current, timeout: 1, depositInterval: 1, redeemInterval: 1 },
    roleHolder,
  );

  await testClient.stopImpersonatingAccount({ address: roleHolder });
};

// A fresh report settles pending deposits and unlocks new redeem batches.
export const submitMellowReport = async () => {
  const { mellow, wstethAddress } = getChainConfig();
  const { oracle, vault } = mellow;

  await ensureTrivialSecurityParams(oracle, vault);

  const publicClient = getPublicClient();
  const testClient = getTestClient();
  const mellowOracleContract = new MellowOracleContract(oracle);
  const vaultContract = new MellowVaultContract(vault);

  const report = await mellowOracleContract.getReport(wstethAddress);

  const minTimestamp = BigInt(report.timestamp) + 1n;
  const latestBlock = await publicClient.getBlock();
  if (latestBlock.timestamp < minTimestamp) {
    await testClient.increaseTime({
      seconds: Number(minTimestamp - latestBlock.timestamp),
    });
    await testClient.mine({ blocks: 1 });
  }

  const submitReportsRoleHex = await mellowOracleContract.getSumbitReportRole();
  // Oracle roles are enumerable on the vault.
  const oracleSubmitter =
    await vaultContract.getRoleMember(submitReportsRoleHex);

  await ensureFunded(oracleSubmitter);
  await testClient.impersonateAccount({ address: oracleSubmitter });

  await mellowOracleContract.submitReports(
    [{ asset: wstethAddress, priceD18: report.priceD18 }],
    oracleSubmitter,
  );

  await testClient.stopImpersonatingAccount({ address: oracleSubmitter });
};

// handleBatches is permissionless; 100 batches is sufficient for the tests.
export const handleMellowBatches = async (
  account: Account | Address,
  batches = 100n,
) => {
  const { asyncRedeemQueue } = getChainConfig().mellow;

  await new AsyncRedeemQueueContract(asyncRedeemQueue).handleBatches(
    batches,
    account,
  );
};

// Fund the vault so an existing fork backlog cannot block the test request.
export const ensureMellowVaultLiquidity = async (
  fromAccount: Account,
  amountWei: bigint,
) => {
  const { mellow, wstethAddress, wstethReferralStakerAddress } =
    getChainConfig();
  const { vault } = mellow;

  await getTestClient().setBalance({
    address: fromAccount.address,
    value: amountWei + parseEther('1'),
  });

  await new WstethReferralStakerContract(wstethReferralStakerAddress).stakeEth(
    fromAccount.address,
    amountWei,
    fromAccount,
  );

  const wstethContract = new Erc20Contract(wstethAddress);
  const mintedBalance = await wstethContract.balanceOf(fromAccount.address);

  await wstethContract.transfer(vault, mintedBalance, fromAccount);
};
