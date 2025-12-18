import type {
  Address,
  Hex,
  TransactionReceipt,
  WaitForCallsStatusReturnType,
} from 'viem';
import { useConfig } from 'wagmi';
import { useMutation } from '@tanstack/react-query';

// @wagmi/core provides async wagmi actions
// avoid putting it in main dependencies as it will eventually conflict with wagmi package
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  sendCalls,
  sendTransaction,
  waitForCallsStatus,
  waitForTransactionReceipt,
} from '@wagmi/core';
import invariant from 'tiny-invariant';

import { useAA } from './use-aa';

const NOOP = async () => {};

export type Flow = 'deposit' | 'withdrawal' | 'claim' | 'mint';
export type TransactionEntry = {
  to: Address;
  data: Hex;
  value?: bigint;
  loadingText?: string;
  loadingDescription?: string;
  signingDescription?: string;
};

export type SendTransactionArguments = {
  transactions: TransactionEntry[] | (() => Promise<TransactionEntry[]>);
  forceAtomic?: boolean;
  forceLegacy?: boolean;
  successText?: string;
  successDescription?: string;
  AATitleText?: string;
  flow: Flow;
  AASigningDescription?: string;
  AALoadingDescription?: string;
};

// TODO: wrapper around error with readable message
type TransactionError = Error;

export type TransactionResponse =
  | {
      isAA: true;
      callStatus: WaitForCallsStatusReturnType;
      receipts: TransactionReceipt[];
    }
  | {
      isAA: false;
      callStatus?: undefined;
      receipts: TransactionReceipt[];
    };

export type TransactionCallbacks = {
  isAA: boolean;
  txIndex: number;
  flow: Flow;
  actionTitleText?: string;
  actionDescriptionText?: string;
} & (
  | {
      stage: 'collection';
    }
  | {
      stage: 'signing';
    }
  | {
      stage: 'awaiting';
      transactionId: Hex;
    }
  | {
      stage: 'success';
      result: TransactionResponse;
    }
  | {
      stage: 'error';
      error: Error;
    }
);

type UseSendTransactionOptions = {
  callback?: (event: TransactionCallbacks) => Promise<void>;
};

export const useSendTransaction = (
  { callback = NOOP }: UseSendTransactionOptions = { callback: NOOP },
) => {
  const config = useConfig();
  const { isAA } = useAA();

  const mutation = useMutation<
    TransactionResponse,
    TransactionError,
    SendTransactionArguments
  >({
    mutationKey: ['sendTransaction', isAA],
    mutationFn: async ({
      transactions,
      forceAtomic,
      forceLegacy,
      successText,
      flow,
      successDescription,
      AATitleText,
      AASigningDescription,
      AALoadingDescription,
    }) => {
      const receipts: TransactionReceipt[] = [];
      const useSendCalls = !forceLegacy && isAA;

      const common = {
        isAA: useSendCalls,
        txIndex: 0,
        flow,
      };

      try {
        // Optionally callback can be provided if some tx prep is async
        if (typeof transactions === 'function') {
          await callback({ ...common, stage: 'collection' });
          transactions = await transactions();
        }

        invariant(
          transactions.length > 0,
          '[useSendTransaction] No transactions provided',
        );

        if (useSendCalls) {
          const calls = transactions.map((tx) => ({
            to: tx.to,
            data: tx.data,
            value: tx.value,
          }));

          // For AA we display single modal with general action text
          await callback({
            ...common,
            stage: 'signing',
            actionTitleText: AATitleText,
            actionDescriptionText: AASigningDescription,
          });

          const { id } = await sendCalls(config, { calls, forceAtomic });

          await callback({
            ...common,
            stage: 'awaiting',
            transactionId: id as Hex,
            actionTitleText: AATitleText,
            actionDescriptionText: AALoadingDescription,
          });

          const callStatus = await waitForCallsStatus(config, { id });

          // TODO: async check if user want to retry with legacy flow
          if (callStatus.status === 'failure') {
            throw new Error('Batch failed');
          }

          const transactionResult = {
            isAA,
            callStatus,
            receipts: callStatus.receipts,
          } as TransactionResponse;

          await callback({
            ...common,
            stage: 'success',
            actionTitleText: successText,
            actionDescriptionText: successDescription,
            result: transactionResult,
          });

          return transactionResult;
        }

        for (const tx of transactions) {
          await callback({
            ...common,
            actionTitleText: tx.loadingText,
            actionDescriptionText: tx.signingDescription,
            stage: 'signing',
          });

          const txHash = await sendTransaction(config, {
            to: tx.to,
            data: tx.data,
            value: tx.value,
          });

          await callback({
            ...common,
            stage: 'awaiting',
            transactionId: txHash,
            actionTitleText: tx.loadingText,
            actionDescriptionText: tx.loadingDescription,
          });
          const txReceipt = await waitForTransactionReceipt(config, {
            hash: txHash,
            confirmations: 1,
          });

          receipts.push(txReceipt);

          if (txReceipt.status !== 'success') {
            throw new Error('Transaction failed');
          }
          common.txIndex += 1;
        }

        const transactionResult = { isAA: useSendCalls, receipts };

        await callback({
          ...common,
          stage: 'success',
          result: transactionResult,
          actionTitleText: successText,
          actionDescriptionText: successDescription,
        });

        return transactionResult;
      } catch (error) {
        await callback({
          ...common,
          stage: 'error',
          error: error as Error,
        });
        console.error(`[useSendTransaction] TX Error`, error);
        throw error;
      }
    },
  });

  return {
    mutation,
    sendTX: mutation.mutateAsync,
    // retryEvent,
    // retryFire,
  };
};

export const withSuccess = <T>(
  promise: Promise<T>,
): Promise<
  | { success: true; result: T; error?: undefined }
  | { success: false; result?: undefined; error: unknown }
> =>
  promise.then(
    (res) => ({
      success: true,
      result: res,
    }),
    (error) => ({
      success: false,
      error,
    }),
  );
