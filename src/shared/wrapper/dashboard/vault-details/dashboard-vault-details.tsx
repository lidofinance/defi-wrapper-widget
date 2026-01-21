import React, { useEffect, useState } from 'react';
import {
  Accordion,
  Separator,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react';
import { useTransactionModal } from '@/shared/components/transaction-modal';

import {
  VaultDetailsContent,
  type VaultDetailsContentProps,
} from './vault-details-content';

export const DashboardVaultDetails: React.FC<
  StackProps & VaultDetailsContentProps
> = ({
  children,
  showLiquidityFee,
  vaultDescription,
  additionalContent,
  showMaxTVL,
  ...props
}) => {
  const [value, setValue] = useState<string[]>([]);
  const { isOpen } = useTransactionModal();

  useEffect(() => {
    if (isOpen) {
      setValue([]);
    }
  }, [isOpen]);

  return (
    <Stack gap="4" {...props}>
      <Separator />
      <Accordion.Root
        multiple
        variant="plain"
        value={value}
        onValueChange={(e: { value: string[] }) => {
          setValue(e.value);
        }}
      >
        <Accordion.Item value={'details'}>
          <Accordion.ItemTrigger cursor="pointer">
            <Text flex="1" fontSize="md" fontWeight="medium">
              Vault details
            </Text>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody>
              {children ?? (
                <VaultDetailsContent
                  showLiquidityFee={showLiquidityFee}
                  vaultDescription={vaultDescription}
                  additionalContent={additionalContent}
                  showMaxTVL={showMaxTVL}
                />
              )}
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};
