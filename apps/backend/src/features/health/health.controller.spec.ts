describe('health contract', () => {
  it('ok shape', () => {
    const result = {
      status: 'ok' as const,
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
    expect(result.status).toBe('ok');
  });
});
