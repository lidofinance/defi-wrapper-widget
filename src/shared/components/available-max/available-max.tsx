import React from 'react';
import { Button, Flex, HStack, SkeletonText, Text } from '@chakra-ui/react';
import { FormatToken } from '@/shared/formatters';
import { Token } from '@/types/token';

type AvailableMaxProps = {
  token: Token;
  availableAmount?: bigint;
  onMaxClick?: () => void;
  disabled?: boolean;
  dedication?: string;
};

export const AvailableMax = ({
  token,
  availableAmount,
  onMaxClick,
  disabled,
  dedication,
}: AvailableMaxProps) => {
  const hasAvailableAmount = typeof availableAmount === 'bigint';
  return (
    <HStack width={hasAvailableAmount ? 'full' : '50%'}>
      <SkeletonText
        loading={!hasAvailableAmount}
        noOfLines={1}
        justifyContent={'flex-end'}
        display="flex"
      >
        <Flex alignItems="center" gap={2}>
          <Text fontSize="xs" color="fg" aria-hidden="true">
            <FormatToken amount={availableAmount} token={token} /> available{' '}
            {dedication && <span>{dedication} </span>}
          </Text>

          {onMaxClick && (
            <Button
              disabled={!availableAmount || disabled}
              colorPalette={'gray'}
              size={'2xs'}
              variant={'subtle'}
              onClick={onMaxClick}
            >
              MAX
            </Button>
          )}
        </Flex>
      </SkeletonText>
    </HStack>
  );
};
