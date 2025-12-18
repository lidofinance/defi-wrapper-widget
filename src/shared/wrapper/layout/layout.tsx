import React from 'react';
import { Card } from '@chakra-ui/react';

import { WidgetFooter } from './footer';
import { WidgetHeader } from './header';

export const WrapperLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Card.Root width="440px" minHeight="632px">
      <Card.Header>
        <WidgetHeader />
      </Card.Header>
      <Card.Body position={'relative'}>{children}</Card.Body>
      <Card.Footer>
        <WidgetFooter />
      </Card.Footer>
    </Card.Root>
  );
};
