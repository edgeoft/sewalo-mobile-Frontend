import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatNpr, getStartingPrice } from '../currency.ts';

describe('currency utils', () => {
  describe('formatNpr', () => {
    it('formats numeric amounts with Rs. prefix', () => {
      assert.strictEqual(formatNpr(1500), 'Rs. 1,500');
    });

    it('formats string numbers correctly', () => {
      assert.strictEqual(formatNpr('2500'), 'Rs. 2,500');
    });

    it('returns N/A for null, undefined, or NaN', () => {
      assert.strictEqual(formatNpr(null), 'N/A');
      assert.strictEqual(formatNpr(undefined), 'N/A');
      assert.strictEqual(formatNpr('invalid'), 'N/A');
    });

    it('formats zero correctly', () => {
      assert.strictEqual(formatNpr(0), 'Rs. 0');
    });
  });

  describe('getStartingPrice', () => {
    it('finds lowest price among offerings', () => {
      const offerings = [{ price: '1200' }, { price: '850' }, { price: '1500' }];
      assert.strictEqual(getStartingPrice(offerings), 'Rs. 850');
    });

    it('returns N/A when offerings are empty or invalid', () => {
      assert.strictEqual(getStartingPrice([]), 'N/A');
      assert.strictEqual(getStartingPrice(null), 'N/A');
      assert.strictEqual(getStartingPrice(undefined), 'N/A');
    });
  });
});
