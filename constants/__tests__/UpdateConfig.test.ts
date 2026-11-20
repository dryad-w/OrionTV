import { UPDATE_CONFIG } from '../UpdateConfig';

describe('UPDATE_CONFIG', () => {
  it('checks versions from the current repository', () => {
    expect(UPDATE_CONFIG.GITHUB_RAW_URL).toContain(
      'raw.githubusercontent.com/dryad-w/OrionTV/refs/heads/master/app.json',
    );
  });

  it('builds APK download URLs for the current release format', () => {
    expect(UPDATE_CONFIG.getDownloadUrl('aq.1.0.1')).toBe(
      'https://ghfast.top/https://github.com/dryad-w/OrionTV/releases/download/aq.1.0.1/orionTV.aq.1.0.1.apk',
    );
  });
});
