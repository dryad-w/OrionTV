import { compareVersions } from '../VersionUtils';

describe('compareVersions', () => {
  it('compares release versions numerically', () => {
    expect(compareVersions('1.0.2', '1.0.1')).toBe(1);
    expect(compareVersions('1.0.1', '1.0.2')).toBe(-1);
    expect(compareVersions('1.0.1', '1.0.1')).toBe(0);
  });

  it('ignores a leading v for numeric versions', () => {
    expect(compareVersions('v1.3.14', '1.3.13')).toBe(1);
    expect(compareVersions('v1.3.14', '1.3.14')).toBe(0);
  });
});
