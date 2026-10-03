import { parseUserAgent } from './device-meta.util';

describe('parseUserAgent', () => {
  it('parses Chrome on Windows', () => {
    const meta = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    expect(meta.browser).toBe('Chrome');
    expect(meta.os).toBe('Windows');
    expect(meta.deviceType).toBe('desktop');
    expect(meta.deviceName).toContain('Chrome');
  });

  it('parses iPhone Safari', () => {
    const meta = parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    );
    expect(meta.os).toBe('iOS');
    expect(meta.deviceType).toBe('mobile');
  });
});
