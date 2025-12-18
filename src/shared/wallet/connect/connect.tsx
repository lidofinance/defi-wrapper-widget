import { FC, useCallback } from 'react';
import { useConnect } from 'reef-knot/core-react';
import { Button, ButtonProps } from '@chakra-ui/react';

export const Connect: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { connect } = useConnect();

  const handleClick = useCallback(() => {
    void connect();
  }, [connect]);

  return (
    <Button onClick={handleClick} data-testid="connectBtn" {...rest}>
      Connect wallet
    </Button>
  );
};
