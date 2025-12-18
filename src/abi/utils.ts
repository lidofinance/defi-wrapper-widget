import type { Abi } from 'viem';

export const onlyAbiErrorsFrom = <TAbi extends Abi>(abi: TAbi) => {
  return abi.filter((item) => item.type === 'error');
};
