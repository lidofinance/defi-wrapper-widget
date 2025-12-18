import { ReactNode } from 'react';
import { Box, Flex, SkeletonText } from '@chakra-ui/react';

type InfoRowProps = {
  description: ReactNode;
  info?: ReactNode;
  isLoading?: boolean;
};

export const InfoRow = ({ description, info, isLoading }: InfoRowProps) => {
  return (
    <Flex justify="space-between" align="center" gap={1}>
      <Box fontSize="sm" width={'1/2'}>
        {description}
      </Box>
      <Box fontSize="sm" width={'1/2'} textAlign="right">
        <SkeletonText loading={isLoading} noOfLines={1} height={'full'}>
          {info ?? '-'}
        </SkeletonText>
      </Box>
    </Flex>
  );
};
