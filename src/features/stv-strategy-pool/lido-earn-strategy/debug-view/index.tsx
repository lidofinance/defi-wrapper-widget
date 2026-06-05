import { LuX } from 'react-icons/lu';
import {
  Button,
  Center,
  Dialog,
  IconButton,
  Portal,
  createOverlay,
} from '@chakra-ui/react';
import { DebugBody } from './debug-body';

const debugDialog = createOverlay((props) => {
  return (
    <Dialog.Root {...props}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p="4">
          <Dialog.Content
            w="full"
            maxW="full"
            maxH="calc(100vh - 2rem)"
            overflow="auto"
          >
            <Dialog.Header>
              <Dialog.Title>Lido Earn Strategy Debug</Dialog.Title>
              <Dialog.CloseTrigger asChild pos="absolute" top="3" right="3">
                <IconButton variant="ghost" size="sm" aria-label="Close">
                  <LuX />
                </IconButton>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body spaceY="4">
              <DebugBody />
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});

export const DebugView = () => {
  return (
    <Center>
      <Button
        m="2"
        variant="solid"
        colorPalette={'yellow'}
        onClick={() => debugDialog.open('debug', {})}
      >
        Open debug
      </Button>
      <debugDialog.Viewport />
    </Center>
  );
};
