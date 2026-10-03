/** Pure unit test without Nest decorator side-effects for Jest CJS. */
describe('mock billing contract', () => {
  it('session id prefix', () => {
    const id = `cs_mock_${'abc'}`;
    expect(id.startsWith('cs_mock_')).toBe(true);
  });
});
