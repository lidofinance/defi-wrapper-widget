import { describe, it, expect } from 'vitest';
import { addressSchema } from './validate-form-value';

describe('addressSchema', () => {
  describe('valid addresses', () => {
    it('accepts a valid checksummed address and lowercases it', () => {
      const result = addressSchema.safeParse(
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
      }
    });

    it('accepts already-lowercase address', () => {
      const result = addressSchema.safeParse(
        '0x0000000000000000000000000000000000000000',
      );
      expect(result.success).toBe(true);
    });

    it('trims surrounding whitespace', () => {
      const result = addressSchema.safeParse(
        '  0x0000000000000000000000000000000000000000  ',
      );
      expect(result.success).toBe(true);
    });
  });

  describe('invalid addresses', () => {
    it('rejects empty string with "Address is required"', () => {
      const result = addressSchema.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Address is required');
      }
    });

    it('rejects non-hex string with "Invalid ethereum address"', () => {
      const result = addressSchema.safeParse('not-an-address');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid ethereum address');
      }
    });

    it('rejects short hex string', () => {
      const result = addressSchema.safeParse('0xdeadbeef');
      expect(result.success).toBe(false);
    });

    it('rejects null', () => {
      const result = addressSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
