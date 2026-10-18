import { HttpException, HttpStatus } from '@nestjs/common';

import { TaxAuthorityAdapter } from './tax.authority.adapter';

function config(get: (key: string) => string | undefined): TaxAuthorityAdapter {
  return new TaxAuthorityAdapter({ get: (k: string) => get(k) } as never);
}

describe('TaxAuthorityAdapter', () => {
  it('returns 503 when not live-configured', async () => {
    const adapter = config(() => 'mock');
    await expect(adapter.submit({ filingId: 'f1', artifact: '' })).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
    });
  });

  it('returns 503 when live but protocol not shipped', async () => {
    const adapter = config((key) => {
      if (key === 'TAX_AUTHORITY_ADAPTER') return 'live';
      if (key === 'TAX_AUTHORITY_API_KEY') return 'secret';
      return undefined;
    });
    await expect(adapter.submit({ filingId: 'f1', artifact: '' })).rejects.toMatchObject({
      status: HttpStatus.SERVICE_UNAVAILABLE,
    });
  });

  it('isLiveConfigured only when live mode and api key', () => {
    expect(config(() => 'mock').isLiveConfigured()).toBe(false);
    expect(
      config((key) => {
        if (key === 'TAX_AUTHORITY_ADAPTER') return 'live';
        return '';
      }).isLiveConfigured(),
    ).toBe(false);
    expect(
      config((key) => {
        if (key === 'TAX_AUTHORITY_ADAPTER') return 'live';
        if (key === 'TAX_AUTHORITY_API_KEY') return 'k';
        return undefined;
      }).isLiveConfigured(),
    ).toBe(true);
  });
});
