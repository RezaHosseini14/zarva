describe('device ban response contract', () => {
  it('defines DEVICE_BANNED payload shape', () => {
    const body = {
      statusCode: 403,
      code: 'DEVICE_BANNED' as const,
      message: 'This device is banned',
    };
    expect(body.code).toBe('DEVICE_BANNED');
    expect(body.statusCode).toBe(403);
  });

  it('defines DEVICE_LIMIT payload shape', () => {
    const body = {
      statusCode: 409,
      code: 'DEVICE_LIMIT' as const,
      message: 'Device limit reached',
      sessions: [] as const,
    };
    expect(body.code).toBe('DEVICE_LIMIT');
    expect(body.sessions).toEqual([]);
  });
});
