import {
  buildUrlWithParams,
  createDefaultRequest,
  formatBytes,
  formatDuration,
  isValidJson,
  substituteVariables,
  applyAuthToHeaders,
  headersFromKeyValues,
} from '@/lib/utils';
import { generateCode } from '@/lib/code-generator';
import { sanitizeResponseContent, maskSecret } from '@/lib/security';
import { createEmptyKeyValue } from '@/lib/utils';

describe('utils', () => {
  it('creates a default request with valid structure', () => {
    const req = createDefaultRequest('Test');
    expect(req.name).toBe('Test');
    expect(req.method).toBe('GET');
    expect(req.auth.type).toBe('none');
  });

  it('builds URL with query params', () => {
    const url = buildUrlWithParams('https://api.example.com/users', [
      { id: '1', key: 'page', value: '1', enabled: true },
      { id: '2', key: 'limit', value: '10', enabled: true },
      { id: '3', key: 'disabled', value: 'x', enabled: false },
    ]);
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
    expect(url).not.toContain('disabled');
  });

  it('substitutes environment variables', () => {
    const result = substituteVariables('{{BASE_URL}}/api/{{USER_ID}}', {
      BASE_URL: 'http://localhost:3000',
      USER_ID: '42',
    });
    expect(result).toBe('http://localhost:3000/api/42');
  });

  it('validates JSON', () => {
    expect(isValidJson('{"a":1}').valid).toBe(true);
    expect(isValidJson('{invalid}').valid).toBe(false);
  });

  it('formats bytes and duration', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatDuration(500)).toBe('500 ms');
    expect(formatDuration(1500)).toBe('1.50 s');
  });

  it('applies bearer auth to headers', () => {
    const headers = applyAuthToHeaders(
      { type: 'bearer', bearerToken: 'abc123' },
      {}
    );
    expect(headers.Authorization).toBe('Bearer abc123');
  });

  it('converts key-value pairs to headers', () => {
    const headers = headersFromKeyValues([
      createEmptyKeyValue(),
      { id: '2', key: 'X-Custom', value: 'test', enabled: true },
    ]);
    expect(headers['X-Custom']).toBe('test');
  });
});

describe('code-generator', () => {
  it('generates JavaScript fetch code', () => {
    const request = createDefaultRequest();
    request.url = 'https://api.example.com/users';
    request.method = 'GET';
    const code = generateCode('javascript-fetch', { request, resolvedUrl: request.url });
    expect(code).toContain('fetch');
    expect(code).toContain('api.example.com');
  });

  it('generates axios code for POST', () => {
    const request = createDefaultRequest();
    request.method = 'POST';
    request.url = 'https://api.example.com/users';
    request.body.content = '{"name":"John"}';
    const code = generateCode('axios', { request, resolvedUrl: request.url });
    expect(code).toContain('axios');
    expect(code).toContain('post');
  });
});

describe('security', () => {
  it('sanitizes response content', () => {
    const result = sanitizeResponseContent('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
  });

  it('masks secrets', () => {
    expect(maskSecret('abcdefghij')).toContain('•');
  });
});
