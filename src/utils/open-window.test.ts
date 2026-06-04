import { describe, it, expect, vi, afterEach } from 'vitest';
import { openWindow } from './open-window';

describe('openWindow', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not throw in a non-browser environment (window undefined)', () => {
    expect(() => openWindow('https://example.com')).not.toThrow();
  });

  it('calls window.open with correct parameters when window is defined', () => {
    const mockOpen = vi.fn();
    vi.stubGlobal('window', { open: mockOpen });
    openWindow('https://example.com');
    expect(mockOpen).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer',
    );
  });
});
