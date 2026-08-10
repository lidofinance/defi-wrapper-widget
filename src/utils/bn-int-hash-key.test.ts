import { describe, it, expect } from 'vitest';
import { bigIntHashKey } from './bn-int-hash-key';

describe('bigIntHashKey', () => {
  describe('BigInt serialization', () => {
    it('serializes a bigint as its string representation', () => {
      expect(bigIntHashKey(1n)).toBe('"1"');
    });

    it('serializes large bigints', () => {
      expect(bigIntHashKey(10n ** 18n)).toBe('"1000000000000000000"');
    });

    it('serializes negative bigints', () => {
      expect(bigIntHashKey(-5n)).toBe('"-5"');
    });

    it('serializes bigint inside an object', () => {
      const result = bigIntHashKey({ amount: 1n });
      expect(result).toContain('"1"');
    });

    it('serializes bigint inside an array', () => {
      const result = bigIntHashKey([1n, 2n]);
      expect(result).toBe('["1","2"]');
    });
  });

  describe('object key sorting', () => {
    it('produces identical output regardless of key insertion order', () => {
      const a = bigIntHashKey({ z: 1, a: 2 });
      const b = bigIntHashKey({ a: 2, z: 1 });
      expect(a).toBe(b);
    });

    it('keys are sorted alphabetically', () => {
      const result = bigIntHashKey({ b: 2, a: 1 });
      expect(result.indexOf('"a"')).toBeLessThan(result.indexOf('"b"'));
    });
  });

  describe('non-bigint values pass through', () => {
    it('strings are preserved', () => {
      expect(bigIntHashKey('hello')).toBe('"hello"');
    });

    it('numbers are preserved', () => {
      expect(bigIntHashKey(42)).toBe('42');
    });

    it('null is preserved', () => {
      expect(bigIntHashKey(null)).toBe('null');
    });

    it('nested plain objects are handled', () => {
      const result = bigIntHashKey({ a: { c: 3, b: 2 } });
      // inner keys also sorted
      const inner = JSON.parse(result);
      expect(Object.keys(inner.a)).toEqual(['b', 'c']);
    });

    it('null-prototype objects (Object.create(null)) are treated as plain objects with sorted keys', () => {
      const noProto = Object.create(null) as Record<string, unknown>;
      noProto.z = 2n;
      noProto.a = 1;
      const result = bigIntHashKey(noProto);
      const parsed = JSON.parse(result);
      expect(parsed.a).toBe(1);
      expect(parsed.z).toBe('2'); // bigint stringified
      expect(Object.keys(parsed)).toEqual(['a', 'z']); // sorted
    });

    it('class instances are not treated as plain objects (key order preserved)', () => {
      class Point { z = 1; a = 2; }
      const result = bigIntHashKey(new Point());
      const parsed = JSON.parse(result);
      // not sorted — class instances skip the plain-object branch
      expect(parsed.z).toBe(1);
      expect(parsed.a).toBe(2);
    });

    it('Object.create(customProto) is not treated as a plain object', () => {
      // Object.getPrototypeOf(x) !== Object.prototype → isPlainObject returns false
      const customProto = { marker: true };
      const x = Object.create(customProto) as any;
      x.b = 2;
      x.a = 1;
      const result = bigIntHashKey(x);
      const parsed = JSON.parse(result);
      // key order not sorted because isPlainObject returned false
      expect(parsed.a).toBe(1);
      expect(parsed.b).toBe(2);
    });
  });
});
