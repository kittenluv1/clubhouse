/**
 * Tests for URL redirect utilities
 *
 * To run these tests, first install Jest:
 * npm install --save-dev jest @testing-library/jest-dom
 *
 * Then add to package.json scripts:
 * "test": "jest",
 * "test:watch": "jest --watch"
 *
 * Run with: npm test
 */

import { isValidReturnUrl, encodeReturnUrl, decodeReturnUrl } from './redirect';

describe('isValidReturnUrl', () => {
  describe('Valid URLs', () => {
    test('should accept simple relative paths', () => {
      expect(isValidReturnUrl('/review')).toBe(true);
      expect(isValidReturnUrl('/clubs')).toBe(true);
      expect(isValidReturnUrl('/profile')).toBe(true);
    });

    test('should accept paths with query parameters', () => {
      expect(isValidReturnUrl('/review?club=Basketball&clubId=123')).toBe(true);
      expect(isValidReturnUrl('/clubs?name=Soccer')).toBe(true);
      expect(isValidReturnUrl('/clubs?categories=Sports,Academic')).toBe(true);
    });

    test('should accept paths with URL fragments', () => {
      expect(isValidReturnUrl('/clubs#section')).toBe(true);
      expect(isValidReturnUrl('/profile#settings')).toBe(true);
    });

    test('should accept nested paths', () => {
      expect(isValidReturnUrl('/clubs/Basketball')).toBe(true);
      expect(isValidReturnUrl('/api/clubs/123')).toBe(true);
      expect(isValidReturnUrl('/very/deep/nested/path')).toBe(true);
    });

    test('should accept paths with special characters (encoded)', () => {
      expect(isValidReturnUrl('/clubs/Women%27s%20Soccer')).toBe(true);
      expect(isValidReturnUrl('/review?club=Club%20Name')).toBe(true);
    });
  });

  describe('Invalid URLs - Protocol-relative URLs', () => {
    test('should reject protocol-relative URLs', () => {
      expect(isValidReturnUrl('//evil.com')).toBe(false);
      expect(isValidReturnUrl('//evil.com/path')).toBe(false);
      expect(isValidReturnUrl('///evil.com')).toBe(false);
    });
  });

  describe('Invalid URLs - Absolute URLs', () => {
    test('should reject http URLs', () => {
      expect(isValidReturnUrl('http://evil.com')).toBe(false);
      expect(isValidReturnUrl('http://localhost:3000/review')).toBe(false);
    });

    test('should reject https URLs', () => {
      expect(isValidReturnUrl('https://evil.com')).toBe(false);
      expect(isValidReturnUrl('https://localhost:3000/review')).toBe(false);
    });
  });

  describe('Invalid URLs - Protocol injection', () => {
    test('should reject javascript protocol at start of URL', () => {
      expect(isValidReturnUrl('javascript:alert(1)')).toBe(false);
      // Note: Query parameters containing these strings are safe - they're just text
      expect(isValidReturnUrl('/path?next=javascript:alert(1)')).toBe(true);
    });

    test('should reject data protocol', () => {
      expect(isValidReturnUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    test('should reject vbscript protocol', () => {
      expect(isValidReturnUrl('vbscript:msgbox')).toBe(false);
    });

    test('should reject file protocol', () => {
      expect(isValidReturnUrl('file:///etc/passwd')).toBe(false);
    });

    test('should reject about protocol', () => {
      expect(isValidReturnUrl('about:blank')).toBe(false);
    });
  });

  describe('Invalid URLs - Backslash tricks', () => {
    test('should reject URLs with backslashes', () => {
      expect(isValidReturnUrl('/\\evil.com')).toBe(false);
      expect(isValidReturnUrl('/path\\evil.com')).toBe(false);
      expect(isValidReturnUrl('/valid/path\\..\\..\\evil')).toBe(false);
    });
  });

  describe('Invalid URLs - Edge cases', () => {
    test('should reject null and undefined', () => {
      expect(isValidReturnUrl(null)).toBe(false);
      expect(isValidReturnUrl(undefined)).toBe(false);
    });

    test('should reject empty strings', () => {
      expect(isValidReturnUrl('')).toBe(false);
      expect(isValidReturnUrl('   ')).toBe(false);
    });

    test('should reject non-string values', () => {
      expect(isValidReturnUrl(123)).toBe(false);
      expect(isValidReturnUrl({})).toBe(false);
      expect(isValidReturnUrl([])).toBe(false);
    });

    test('should reject URLs that dont start with /', () => {
      expect(isValidReturnUrl('review')).toBe(false);
      expect(isValidReturnUrl('clubs/basketball')).toBe(false);
    });

    test('should reject extremely long URLs', () => {
      const longPath = '/review' + 'a'.repeat(3000);
      expect(isValidReturnUrl(longPath)).toBe(false);
    });
  });

  describe('Security - Case sensitivity', () => {
    test('should be case-insensitive for protocol detection at URL start', () => {
      expect(isValidReturnUrl('JavaScript:alert(1)')).toBe(false);
      expect(isValidReturnUrl('JAVASCRIPT:alert(1)')).toBe(false);
      expect(isValidReturnUrl('JaVaScRiPt:alert(1)')).toBe(false);
    });

    test('should detect protocol-based absolute URLs at start', () => {
      expect(isValidReturnUrl('http://evil.com')).toBe(false);
      expect(isValidReturnUrl('HTTP://evil.com')).toBe(false);
      expect(isValidReturnUrl('https://evil.com')).toBe(false);
      expect(isValidReturnUrl('HTTPS://evil.com')).toBe(false);
    });
  });
});

describe('encodeReturnUrl', () => {
  test('should encode URLs with special characters', () => {
    const url = '/review?club=Women\'s Soccer';
    const encoded = encodeReturnUrl(url);
    expect(encoded).toContain('%');
    expect(encoded).not.toContain(' ');
    // Note: encodeURIComponent doesn't encode single quotes ('), this is standard behavior
    expect(encoded).toContain('Women');
  });

  test('should encode URLs with multiple parameters', () => {
    const url = '/clubs?name=Test&categories=Sports,Academic';
    const encoded = encodeReturnUrl(url);
    expect(encoded).toBe(encodeURIComponent(url));
  });

  test('should handle simple paths', () => {
    expect(encodeReturnUrl('/review')).toBe('%2Freview');
    expect(encodeReturnUrl('/clubs')).toBe('%2Fclubs');
  });
});

describe('decodeReturnUrl', () => {
  test('should decode encoded URLs', () => {
    const original = '/review?club=Basketball&clubId=123';
    const encoded = encodeURIComponent(original);
    expect(decodeReturnUrl(encoded)).toBe(original);
  });

  test('should handle URLs with special characters', () => {
    const original = '/clubs?name=Women\'s Soccer';
    const encoded = encodeURIComponent(original);
    const decoded = decodeReturnUrl(encoded);
    expect(decoded).toBe(original);
  });

  test('should handle malformed URLs gracefully', () => {
    // Suppress expected console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const malformed = '%E0%A4%A'; // Invalid UTF-8
    const result = decodeReturnUrl(malformed);
    expect(result).toBe(''); // Should return empty string on error

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to decode returnUrl:',
      expect.any(Error)
    );

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  test('should handle already decoded URLs', () => {
    const url = '/review?club=Test';
    expect(decodeReturnUrl(url)).toBe(url);
  });
});

describe('Encoding round-trip', () => {
  test('should preserve URL through encode/decode cycle', () => {
    const urls = [
      '/review',
      '/clubs?name=Basketball',
      '/profile#settings',
      '/clubs/Women\'s%20Soccer',
      '/review?club=Test&clubId=123&returnUrl=/clubs'
    ];

    urls.forEach(url => {
      const encoded = encodeReturnUrl(url);
      const decoded = decodeReturnUrl(encoded);
      expect(decoded).toBe(url);
    });
  });
});

describe('Integration scenarios', () => {
  test('should handle real-world sign-in redirect scenarios', () => {
    // Scenario 1: User clicks "Write Review" from header
    const reviewUrl = '/review';
    expect(isValidReturnUrl(reviewUrl)).toBe(true);

    // Scenario 2: User clicks "Leave Review" from club details
    const reviewWithParams = '/review?club=Basketball&clubId=123';
    expect(isValidReturnUrl(reviewWithParams)).toBe(true);

    // Scenario 3: User likes club from details page
    const clubDetails = '/clubs/Basketball%20Club';
    expect(isValidReturnUrl(clubDetails)).toBe(true);

    // Scenario 4: User saves club from clubs list
    const clubsList = '/clubs?categories=Sports&sort=rating';
    expect(isValidReturnUrl(clubsList)).toBe(true);
  });

  test('should reject malicious redirect attempts', () => {
    const maliciousUrls = [
      '//attacker.com',
      'https://phishing.com/fake-login',
      'javascript:document.location="http://evil.com"',
      'data:text/html,<script>steal()</script>'
    ];

    maliciousUrls.forEach(url => {
      expect(isValidReturnUrl(url)).toBe(false);
    });
  });

  test('should allow relative URLs with query params (application handles param validation)', () => {
    // These are relative URLs to our own application - the returnUrl validator
    // only ensures we redirect to our own domain, not external sites.
    // What pages do with their query parameters is their own validation responsibility.
    const validInternalUrls = [
      '/legitimate?next=//attacker.com',
      '/page?param=http://example.com',
      '/search?q=javascript:alert(1)'
    ];

    validInternalUrls.forEach(url => {
      expect(isValidReturnUrl(url)).toBe(true);
    });
  });
});
