import { ContractFunctionExecutionError } from 'viem';

export const isRevertError = (
  e: unknown,
): e is ContractFunctionExecutionError =>
  e instanceof ContractFunctionExecutionError;
