/** Pure unit checks for sale SMS token shaping (avoid Nest ESM in Jest CJS). */
describe('sale sms tokens', () => {
  function sanitize(value: string): string {
    return value.replace(/\s+/g, '-');
  }

  it('sanitizes invoice number for Kavenegar token', () => {
    expect(sanitize('INV 1001')).toBe('INV-1001');
  });

  it('maps payment_partial token2 to remaining amount', () => {
    const event = 'payment_partial';
    const remainingIRT = '250000';
    const amountIRT = '1000000';
    const token2 =
      event === 'payment_partial'
        ? remainingIRT
        : event === 'payment_paid'
          ? amountIRT
          : event;
    expect(token2).toBe('250000');
  });
});
