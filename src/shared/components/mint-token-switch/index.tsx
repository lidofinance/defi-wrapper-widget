import React from 'react';
import { Button, Span, Text } from '@chakra-ui/react';
import { MINT_TOKENS_VALUE_TYPE } from '@/shared/hook-form/validation';
import { tokenLabel } from '@/utils/token-label';
import RepayIcon from 'assets/icons/repay.svg?react';

type MintTokenSwitchProps = {
  label: string;
  token: MINT_TOKENS_VALUE_TYPE;
  onTokenChange: (token: MINT_TOKENS_VALUE_TYPE) => void;
};

export const MintTokenSwitch: React.FC<MintTokenSwitchProps> = ({
  label,
  token,
  onTokenChange,
}) => {
  const onClick = () => {
    onTokenChange(token === 'WSTETH' ? 'STETH' : 'WSTETH');
  };
  return (
    <Text fontSize="sm" w={'50%'} gap={0}>
      <Span>{label} </Span>

      <Button
        variant="plain"
        onClick={onClick}
        height={'1.15em'}
        minWidth={'1em'}
        pl={0}
        verticalAlign={'text-bottom'}
      >
        <Span fontWeight={'bold'} color={'colorPalette.600'}>
          {tokenLabel(token)}
        </Span>
        <RepayIcon width={'1em'} height={'1em'} />
      </Button>
    </Text>
  );
};
