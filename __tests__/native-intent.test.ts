import { MAX_SYSTEM_PATH_LENGTH, redirectSystemPath } from '../app/+native-intent';

describe('native intent validation', () => {
  test.each([
    '/entry/hedde',
    '/entry/hedder?source=history',
    'danskdictionary://entry/%C3%A6ble?label=dan%C3%A9s',
    '/entry/hedde?escapedPercent=%25',
  ])('preserves a valid system path: %s', (path) => {
    expect(redirectSystemPath({ path, initial: true })).toBe(path);
  });

  test.each(['/entry/%', '/entry/%E0%A4%A', '/entry/%C0%AF'])(
    'rejects malformed URI encoding: %s',
    (path) => {
      expect(redirectSystemPath({ path, initial: false })).toBe('/');
    },
  );

  test('accepts the maximum path length', () => {
    const path = 'a'.repeat(MAX_SYSTEM_PATH_LENGTH);

    expect(redirectSystemPath({ path, initial: true })).toBe(path);
  });

  test('rejects a path above the maximum length', () => {
    const path = 'a'.repeat(MAX_SYSTEM_PATH_LENGTH + 1);

    expect(redirectSystemPath({ path, initial: true })).toBe('/');
  });
});
