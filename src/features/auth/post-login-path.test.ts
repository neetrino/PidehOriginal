import { describe, expect, it } from 'vitest';

import { resolvePostLoginPath } from '@/features/auth/post-login-path';

describe('resolvePostLoginPath', () => {
  it('sends admins to the admin panel when next is missing', () => {
    expect(
      resolvePostLoginPath({ locale: 'hy', role: 'ADMIN', next: null }),
    ).toBe('/hy/admin');
  });

  it('sends customers to profile when next is missing', () => {
    expect(
      resolvePostLoginPath({ locale: 'hy', role: 'CUSTOMER', next: null }),
    ).toBe('/hy/profile');
  });

  it('does not send admins to the generic profile home', () => {
    expect(
      resolvePostLoginPath({ locale: 'en', role: 'ADMIN', next: '/en/profile' }),
    ).toBe('/en/admin');
  });

  it('keeps a safe next path for both roles', () => {
    expect(
      resolvePostLoginPath({
        locale: 'hy',
        role: 'ADMIN',
        next: '/hy/checkout',
      }),
    ).toBe('/hy/checkout');
    expect(
      resolvePostLoginPath({
        locale: 'hy',
        role: 'CUSTOMER',
        next: '/hy/wishlist',
      }),
    ).toBe('/hy/wishlist');
  });

  it('rejects open redirects', () => {
    expect(
      resolvePostLoginPath({
        locale: 'hy',
        role: 'ADMIN',
        next: '//evil.example',
      }),
    ).toBe('/hy/admin');
    expect(
      resolvePostLoginPath({
        locale: 'hy',
        role: 'CUSTOMER',
        next: '/en/profile',
      }),
    ).toBe('/hy/profile');
  });
});
