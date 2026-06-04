import { describe, it, expect } from 'vitest';
import { awaitWithTimeout } from './await-with-timeout';

describe('awaitWithTimeout', () => {
  it('resolves with the promise value when it settles before timeout', async () => {
    const result = await awaitWithTimeout(Promise.resolve(42), 1000);
    expect(result).toBe(42);
  });

  it('rejects with timeout error when promise exceeds timeout', async () => {
    const never = new Promise<never>(() => {});
    await expect(awaitWithTimeout(never, 10)).rejects.toThrow(
      'promise timeout',
    );
  });

  it('rejects immediately if the promise itself rejects', async () => {
    const failing = Promise.reject(new Error('inner error'));
    await expect(awaitWithTimeout(failing, 1000)).rejects.toThrow(
      'inner error',
    );
  });

  it('resolves with non-primitive values', async () => {
    const obj = { a: 1n };
    const result = await awaitWithTimeout(Promise.resolve(obj), 1000);
    expect(result).toBe(obj);
  });
});
