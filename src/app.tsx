import React from 'react';
import { Center, ChakraProvider, Theme } from '@chakra-ui/react';
import { WrapperSwitch } from '@/features/wrapper-switch';
import { ModalProvider } from '@/providers/modal-provider';
import { system } from '@/theme';
import { usePostMessageAutoHeight } from '@/utils/use-iframe-resize';

const App: React.FC = () => {
  usePostMessageAutoHeight('#root');

  return (
    <ChakraProvider value={system}>
      <Theme colorPalette="blue" backgroundColor="transparent">
        <ModalProvider>
          <Center>
            <WrapperSwitch />
          </Center>
        </ModalProvider>
      </Theme>
    </ChakraProvider>
  );
};

export default App;
