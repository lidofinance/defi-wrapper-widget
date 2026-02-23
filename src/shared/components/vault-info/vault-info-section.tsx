import { FiInfo } from 'react-icons/fi';
import { Box, VStack } from '@chakra-ui/react';
import { Tooltip } from '../tooltip';

type VaultInfoSectionProps = React.PropsWithChildren<{
  label?: React.ReactNode;
  hint?: React.ReactNode;
}>;

export const VaultInfoSection = ({
  label,
  children,
  hint,
}: VaultInfoSectionProps) => {
  return (
    <VStack align="stretch">
      <Box fontSize="sm" fontWeight="normal" color="fg">
        {label}{' '}
        {hint && (
          <Tooltip content={hint} positioning={{ placement: 'top' }}>
            <FiInfo
              style={{ display: 'inline', top: '-2px', position: 'relative' }}
              size={16}
              color={'var(--chakra-colors-fg-subtle)'}
            />
          </Tooltip>
        )}
      </Box>
      <VStack>{children}</VStack>
    </VStack>
  );
};
