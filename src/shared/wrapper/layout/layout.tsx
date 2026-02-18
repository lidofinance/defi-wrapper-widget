import React from 'react';
import { Card } from '@chakra-ui/react';

import { WidgetHeader } from './header';

export const WrapperLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Card.Root width="440px">
      <Card.Header>
        <WidgetHeader />
      </Card.Header>
      <Card.Body position={'relative'} pb={6}>{children}</Card.Body>
    </Card.Root>
  );
};
