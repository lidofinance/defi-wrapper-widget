import React from 'react';
import { Center, ChakraProvider, Theme } from '@chakra-ui/react';
import { WrapperSwitch } from '@/features/wrapper-switch';
import { system } from '@/theme';
import { usePostMessageAutoHeight } from './iframe-demo-wrapper/use-iframe-resize';

const App: React.FC = () => {
  usePostMessageAutoHeight('#root');

  return (
    <ChakraProvider value={system}>
      <Theme colorPalette="obol" backgroundColor="transparent">
        <Center>
          <WrapperSwitch />
        </Center>
      </Theme>
    </ChakraProvider>
  );
};

export default App;
