import type { Dispatch } from 'react';
import { Flow, TransactionCallbacks } from '@/modules/web3';

// todo: update
export type TransactionResponse = unknown;

type TransactionModalStage =
  | 'none'
  | 'collection'
  | 'signing'
  | 'awaiting'
  | 'success'
  | 'error';

type TransactionModalDetails = {
  actionDescriptionText: string;
  actionTitleText: string;
  transactionId?: string;
  transactionResult?: TransactionResponse;
  isAA: boolean;
  flow: Flow;
};

export type TransactionModalState = {
  isOpen: boolean;
  stage: TransactionModalStage;
  details: TransactionModalDetails;
};

export type TransactionModalAction = {
  stage: TransactionModalStage;
  details?: Partial<TransactionModalDetails>;
};

export type TransactionModalContextValue = TransactionModalState & {
  dispatchModal: Dispatch<TransactionModalAction>;
  onTransactionStageChange: (stage: TransactionCallbacks) => Promise<void>;
};
