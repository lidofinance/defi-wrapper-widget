import { useCallback } from 'react';
import copy from 'copy-to-clipboard';
import { toaster } from '@/shared/components/toaster/toaster';

export const useCopyToClipboard = (text: string): (() => void) => {
  return useCallback(() => {
    copy(text);
    toaster.create({
      title: 'Copied to clipboard',
    });
  }, [text]);
};
