import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatPhone, unformatPhone } from '../../features/auth/utils/phone.ts';
import { cleanDescriptionText, getReadTime, toStringArray } from '../text.ts';
import { formatDate, formatTime, convertTimeTo24h, parseTime12h } from '../time.ts';
import { getProviderRating } from '../rating.ts';
import { encodeGeohash, quantizeCoord } from '../geohash.ts';

describe('text utils', () => {
  it('cleanDescriptionText strips HTML tags and trims', () => {
    assert.strictEqual(cleanDescriptionText('<p>Hello <b>World</b></p>'), 'Hello World');
    assert.strictEqual(cleanDescriptionText(null), '');
    assert.strictEqual(cleanDescriptionText(undefined), '');
  });

  it('getReadTime calculates appropriate read minutes', () => {
    assert.strictEqual(getReadTime(null), '3 min read');
    assert.strictEqual(getReadTime('short text'), '1 min read');
  });

  it('toStringArray normalizes arrays and CSV strings', () => {
    assert.deepStrictEqual(toStringArray(['a', 'b']), ['a', 'b']);
    assert.deepStrictEqual(toStringArray('a, b, c'), ['a', 'b', 'c']);
    assert.deepStrictEqual(toStringArray(null), []);
    assert.deepStrictEqual(toStringArray(undefined), []);
  });
});

describe('phone utils', () => {
  it('formatPhone prefixes with +977 correctly', () => {
    assert.strictEqual(formatPhone('9800000000'), '+9779800000000');
    assert.strictEqual(formatPhone('9779800000000'), '+9779800000000');
    assert.strictEqual(formatPhone('+9779800000000'), '+9779800000000');
  });

  it('unformatPhone strips +977 prefix', () => {
    assert.strictEqual(unformatPhone('+9779800000000'), '9800000000');
    assert.strictEqual(unformatPhone('9800000000'), '9800000000');
    assert.strictEqual(unformatPhone(null), '');
  });
});

describe('time utils', () => {
  it('formatTime formats ISO and standard time strings', () => {
    assert.strictEqual(formatTime('2026-08-20T09:30:00.000Z'), '09:30');
    assert.strictEqual(formatTime('14:45:00'), '14:45');
    assert.strictEqual(formatTime('02:15 PM'), '14:15');
    assert.strictEqual(formatTime(null), '');
  });

  it('convertTimeTo24h converts 12h format to HH:MM:00', () => {
    assert.strictEqual(convertTimeTo24h('02:30 PM'), '14:30:00');
    assert.strictEqual(convertTimeTo24h('09:15 AM'), '09:15:00');
  });

  it('parseTime12h converts 24h to 12h AM/PM', () => {
    assert.strictEqual(parseTime12h('14:30'), '02:30 PM');
    assert.strictEqual(parseTime12h('09:15'), '09:15 AM');
    assert.strictEqual(parseTime12h(null), null);
  });

  it('formatDate formats YYYY-MM-DD correctly', () => {
    assert.strictEqual(formatDate('2026-08-20'), 'Aug 20, 2026');
    assert.strictEqual(formatDate(null), '');
  });
});

describe('rating utils', () => {
  it('resolves ratings following precedence', () => {
    assert.strictEqual(getProviderRating([{ average_rating: '4.8' }, { avg_rating: 4.2 }]), 4.8);
    assert.strictEqual(getProviderRating([{ average_rating: '' }, { avg_rating: 4.5 }]), 4.5);
    assert.strictEqual(getProviderRating([], 0), 0);
  });
});

describe('geohash utils', () => {
  it('encodeGeohash generates consistent geohashes', () => {
    const hash = encodeGeohash(27.700769, 85.30014, 6);
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 6);
  });

  it('quantizeCoord rounds to specified decimals', () => {
    assert.strictEqual(quantizeCoord(27.700769, 3), 27.701);
  });
});
