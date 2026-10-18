import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { assertBusinessDateString, businessDateKey } from './gold-ledger';

describe('businessDateKey', () => {
  it('accepts YYYY-MM-DD strings', () => {
    assert.equal(businessDateKey('2026-10-03'), '2026-10-03');
  });

  it('rejects invalid strings', () => {
    assert.throws(() => assertBusinessDateString('not-a-date'));
  });

  it('formats Date in Asia/Tehran', () => {
    // 2026-10-02 21:30 UTC = 2026-10-03 01:00 Tehran
    const d = new Date('2026-10-02T21:30:00.000Z');
    assert.equal(businessDateKey(d), '2026-10-03');
  });
});
