import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { DisplayableError } from '@/modules/vaults';
import { TransactionCallbacks } from '@/modules/web3';
import { TransactionModalContent } from './transaction-modal-content';

import type {
  TransactionModalAction,
  TransactionModalContextValue,
  TransactionModalState,
} from './types';

// todo: don't like it here, move to some other file
export const DEFAULT_SIGNING_DESCRIPTION =
  'Confirm this transaction in your wallet';
export const DEFAULT_LOADING_DESCRIPTION = 'Awaiting block confirmation';

const TransactionModalContext =
  createContext<TransactionModalContextValue | null>(null);
TransactionModalContext.displayName = 'TransactionModalContext';

export const useTransactionModal = () => {
  const context = useContext(TransactionModalContext);
  if (!context) {
    throw new Error(
      'useTransactionModalContext must be used within a TransactionModalProvider',
    );
  }
  return context;
};

const reducer = (
  state: TransactionModalState,
  action: TransactionModalAction,
): TransactionModalState => {
  return {
    ...state,
    isOpen: action.stage !== 'none',
    stage: action.stage,
    details: {
      ...state.details,
      ...(action.details ?? {}),
    },
  };
};

const initialState: TransactionModalState = {
  isOpen: false,
  stage: 'none',
  details: {
    actionTitleText: '',
    flow: 'deposit',
    actionDescriptionText: '',
    isAA: false,
  },
};

export const TransactionModal = ({
  children,
  backToDashboard,
  onModalOpen,
  isDashboardAvailable,
}: PropsWithChildren & {
  backToDashboard: () => void;
  onModalOpen: () => void;
  isDashboardAvailable: boolean;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onTransactionStageChange = useCallback(
    async (data: TransactionCallbacks) => {
      const common = {
        actionTitleText: data.actionTitleText,
        actionDescriptionText: data.actionDescriptionText,
        isAA: data.isAA,
        flow: data.flow,
      };

      switch (data.stage) {
        case 'success':
          return dispatch({
            stage: 'success',
            details: {
              ...common,
            },
          });
        case 'error':
          return dispatch({
            stage: 'error',
            details: {
              ...common,
              actionTitleText: 'Transaction have been reverted',
              actionDescriptionText:
                data.error instanceof DisplayableError
                  ? data.error.message
                  : undefined,
            },
          });
        case 'signing':
          return dispatch({
            stage: 'signing',
            details: {
              ...common,
            },
          });
        case 'awaiting':
          dispatch({
            stage: 'awaiting',
            details: {
              transactionId: data.transactionId,
              ...common,
            },
          });
      }
    },
    [dispatch],
  );

  const value = useMemo(() => {
    return {
      ...state,
      dispatchModal: dispatch,
      onTransactionStageChange,
    };
  }, [state, onTransactionStageChange]);

  return (
    <TransactionModalContext.Provider value={value}>
      {children}
      <TransactionModalContent
        backToDashboard={backToDashboard}
        onModalOpen={onModalOpen}
        isDashboardAvailable={isDashboardAvailable}
      />
    </TransactionModalContext.Provider>
  );
};
