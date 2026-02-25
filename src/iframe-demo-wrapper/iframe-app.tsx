import React, { useCallback, useRef, useState } from 'react';
import {
  Box,
  ChakraProvider,
  defaultSystem,
  Link,
  Stack,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useIframeResize } from './use-iframe-resize';

type MODES = 'StvPool' | 'StvStETHPool' | 'StvStrategyPool';

export const IframeApp: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [mode, setMode] = useState<MODES>('StvPool');

  const iframeUrl = `./${mode}/index.html?random=${Math.random()}`;

  useIframeResize(iframeRef);

  const injectCss = useCallback(() => {
    const frame = iframeRef.current;
    if (!frame) return;

    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) return;

    const style = doc.createElement('style');
    style.textContent = `
       body { overflow:hidden; margin: 0; padding: 0; }
 
    `;
    doc.head.appendChild(style);
  }, []);

  return (
    <ChakraProvider value={defaultSystem}>
      <Stack alignItems="center" mt={10}>
        <Tabs.Root
          value={mode}
          colorPalette={'orange'}
          onValueChange={(e: { value: string }) => setMode(e.value as MODES)}
          defaultValue="stake"
        >
          <Tabs.List>
            <Tabs.Trigger value="StvPool" asChild>
              <Text fontSize="lg" fontWeight={'bold'} textAlign={'center'}>
                StvPool
              </Text>
            </Tabs.Trigger>
            <Tabs.Trigger value="StvStETHPool" asChild>
              <Text fontSize="lg" fontWeight={'bold'} textAlign={'center'}>
                StvStETHPool
              </Text>
            </Tabs.Trigger>
            <Tabs.Trigger value="StvStrategyPool" asChild>
              <Text fontSize="lg" fontWeight={'bold'} textAlign={'center'}>
                StvStrategyPool
              </Text>
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        <Text fontSize={'xs'} fontWeight={400}>
          inside of an iframe <br />
          <Link variant="underline" href={`${iframeUrl}`}>
            pure react widget
          </Link>
        </Text>

        <Box
          border="none"
          boxShadow="lg"
          bg="transparent"
          width="440px"
          margin="0 auto 60px"
        >
          <iframe
            ref={iframeRef}
            key={iframeUrl}
            title="Widget"
            src={iframeUrl}
            width="100%"
            style={{
              border: 'none',
              height: '0px',
              display: 'block',
              minHeight: '320px',
            }}
            sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
            onLoad={injectCss}
          />
        </Box>
      </Stack>
    </ChakraProvider>
  );
};
