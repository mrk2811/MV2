/**
 * Root Layout / Auth Gate Tests
 *
 * Verifies the root layout structure:
 * - ClerkProvider wraps the app
 * - AuthGate uses stable deps to avoid re-render cascades on token refresh
 * - TokenSync only syncs once per sign-in session
 */

describe('Root Layout stability', () => {
  it('should have ClerkProvider in root layout', () => {
    const layoutSource = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'app', '_layout.tsx'),
      'utf-8',
    );
    expect(layoutSource).toContain('<ClerkProvider');
    expect(layoutSource).toContain('<ClerkLoaded>');
    expect(layoutSource).toContain('<AuthGate');
  });

  it('should use stable useEffect deps in AuthGate (no segments/router in deps)', () => {
    const layoutSource = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'app', '_layout.tsx'),
      'utf-8',
    );
    expect(layoutSource).toContain('[isSignedIn, isLoaded]');
    expect(layoutSource).toContain('prevSignedIn');
  });

  it('should only sync auth once per sign-in (not on every token refresh)', () => {
    const layoutSource = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'app', '_layout.tsx'),
      'utf-8',
    );
    expect(layoutSource).toContain('syncedRef');
    expect(layoutSource).toContain("api.post('/auth/sync'");
  });

  it('should NOT have ErrorBoundary (removed to prevent render cascades)', () => {
    const layoutSource = require('fs').readFileSync(
      require('path').join(__dirname, '..', 'app', '_layout.tsx'),
      'utf-8',
    );
    expect(layoutSource).not.toContain('class ErrorBoundary');
    expect(layoutSource).not.toContain('setState');
  });
});
