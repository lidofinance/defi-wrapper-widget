import { RefObject, useEffect, useRef } from 'react';

const EVENT = 'iframe-resize';

type ResizeMessage = {
  type: typeof EVENT;
  height: number;
};

export const initResizeEventEmitter = (rootElementId = 'root') => {
  let lastHeight = 0;

  const send = (height: number) => {
    window.parent.postMessage({ type: EVENT, height }, '*');
  };

  const el = document.getElementById(rootElementId);
  if (!el) return;

  const ro = new ResizeObserver((entries) => {
    const h = Math.round(entries[0].contentRect.height);
    if (Math.abs(h - lastHeight) < 2) return;
    lastHeight = h;
    send(h);
  });

  ro.observe(el);
  send(el.getBoundingClientRect().height);
};

export const useIframeResize = (
  iframeRef: RefObject<HTMLIFrameElement | null>,
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
