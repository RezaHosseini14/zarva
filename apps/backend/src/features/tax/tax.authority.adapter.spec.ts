import { HttpException } from '@nestjs/common';

import { TaxAuthorityAdapter } from './tax.authority.adapter';

describe('TaxAuthorityAdapter', () => {
  it('returns 501 when not live', async () => {
    const adapter = new TaxAuthorityAdapter({ get: () => 'mock' } as never);
    await expect(adapter.submit({ filingId: 'f1', artifact: '' })).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('submits when live', async () => {
    const adapter = new TaxAuthorityAdapter({ get: () => 'live' } as never);
    const result = await adapter.submit({ filingId: 'f1-2-3-4', artifact: 'x' });
    expect(result.reference).toContain('TAX-');
  });
});
