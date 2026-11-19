import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Header = { key: string; value: string };
type VercelConfig = { headers?: Array<{ source: string; headers: Header[] }> };

const configPath = resolve(process.cwd(), 'vercel.json');
const config = JSON.parse(readFileSync(configPath, 'utf8')) as VercelConfig;
const globalRule = config.headers?.find((rule) => rule.source === '/(.*)');
const headers = new Map(globalRule?.headers.map(({ key, value }) => [key, value]));

describe('Vercel browser security policy', () => {
  it('applies security headers to every route', () => {
    expect(globalRule).toBeDefined();
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headers.get('Permissions-Policy')).toContain('geolocation=()');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headers.get('X-Frame-Options')).toBe('DENY');
    expect(headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
  });

  it('restricts executable content and framing to this application', () => {
    const policy = headers.get('Content-Security-Policy');
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("script-src 'self'");
    expect(policy).toContain("connect-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
  });
});
