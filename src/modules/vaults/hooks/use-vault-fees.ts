import { useQuery } from '@tanstack/react-query';
import invariant from 'tiny-invariant';
import { VAULT_TOTAL_BASIS_POINTS } from '../consts';
import { useVault } from '../vault-context';

const bpToPercent = (bp: bigint | number) =>
  (Number(bp) / VAULT_TOTAL_BASIS_POINTS) * 100;

export const useVaultFees = () => {
  const { activeVault, queryKeys } = useVault();
  return useQuery({
    queryKey: [...queryKeys.base, 'fees'],
    enabled: !!activeVault,
    queryFn: async () => {
      invariant(activeVault, 'Vault is required');

      const [nodeOperatorFeeRateBP, connection] = await Promise.all([
        activeVault.dashboard.read.feeRate(),
        activeVault.dashboard.read.vaultConnection(),
      ]);

      return {
        nodeOperatorFeeRatePercent: bpToPercent(nodeOperatorFeeRateBP),
        lidoLiquidityFeeRatePercent: bpToPercent(connection.liquidityFeeBP),
        lidoInfrastructureFeeRatePercent: bpToPercent(connection.infraFeeBP),
        lidoReservationFeePercent: bpToPercent(connection.reservationFeeBP),
      };
    },
  });
};
