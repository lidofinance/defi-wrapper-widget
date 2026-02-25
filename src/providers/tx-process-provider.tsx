import React, { createContext, useContext, useState } from 'react';
import invariant from 'tiny-invariant';

export interface TxProcessContextType {
  txType: TxType;

  isProcessing: boolean;
  amount: bigint;
  startTx: (type: TxType, amount: bigint) => void;
}

export type TxType = 'deposit' | 'withdraw' | 'claim' | null;
const TxProcessContext = createContext<TxProcessContextType | undefined>(
  undefined,
);

export const useTxProcessContext = () => {
  const context = useContext(TxProcessContext);
  invariant(context, 'useTxProcess must be used within a TxProcessProvider');
  return context;
};

interface TxProcessProviderProps {
  children: React.ReactNode;
}

export const TxProcessProvider: React.FC<TxProcessProviderProps> = ({
  children,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [txType, setTxType] = useState<TxType>(null);
  const [amount, setAmount] = useState<bigint>(0n);

  const startTx = (type: TxType, amountTx: bigint) => {
    setTxType(type);
    setIsProcessing(true);
    setAmount(amountTx);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const value = {
    txType,
    isProcessing,
    startTx,
    amount,
  };

  return (
    <TxProcessContext.Provider value={value}>
      {' '}
      {children}{' '}
    </TxProcessContext.Provider>
  );
};
