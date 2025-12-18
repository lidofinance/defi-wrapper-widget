import { MutableRefObject, useEffect, useRef } from 'react';

const EVENT = 'iframe-resize';

type ResizeMessage = {
  type: 'iframe-resize';
  height: number;
};

export const useIframeResize = (
  iframeRef: MutableRefObject<HTMLIFrameElement | null>,
) => {
  const lastHeightRef = useRef(0);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!iframeRef.current) return;
      if (e.source !== iframeRef.current.contentWindow) return;

      const data = e.data as ResizeMessage;
      if (!data || data.type !== EVENT) return;

      const nextHeight = Math.round(data.height);

      lastHeightRef.current = nextHeight;

      requestAnimationFrame(() => {
        if (!iframeRef.current) return;
        iframeRef.current.style.height = `${nextHeight}px`;
      });
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [iframeRef]);
};

export const usePostMessageAutoHeight = (rootSelector: string = '#root') => {
  const lastHeightRef = useRef(0);

  const send = (height: number) => {
    window.parent.postMessage({ type: EVENT, height }, '*');
  };

  useEffect(() => {
    const root = document.querySelector(rootSelector);

    if (!root) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const h = Math.round(entry.contentRect.height);

      if (Math.abs(h - lastHeightRef.current) < 2) return;

      lastHeightRef.current = h;

      send(h);
    });

    ro.observe(root);

    const newSize = root.getBoundingClientRect().height;
    send(newSize);

    return () => ro.disconnect();
  }, [rootSelector]);
};
