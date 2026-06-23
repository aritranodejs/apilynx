import type { ApiRequest, HttpMethod, KeyValuePair } from '@/types';
import { createDefaultAuth, createDefaultBody, createDefaultRequest, generateId } from '@/lib/utils';

export interface ParsedCurl {
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  body: ApiRequest['body'];
  auth: ApiRequest['auth'];
  params: KeyValuePair[];
}

function tokenizeCurl(input: string): string[] {
  const normalized = input
    .trim()
    .replace(/\\\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^curl\s+/i, '');
  const tokens: string[] = [];
  let current = '';
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
        tokens.push(current);
        current = '';
      } else if (ch === '\\' && quote === '"' && i + 1 < normalized.length) {
        current += normalized[++i];
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      if (current) {
        tokens.push(current);
        current = '';
      }
      quote = ch;
      continue;
    }
    if (ch === ' ') {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function toKeyValues(record: Record<string, string>): KeyValuePair[] {
  const entries = Object.entries(record);
  if (entries.length === 0) return [{ id: generateId(), key: '', value: '', enabled: true }];
  return entries.map(([key, value]) => ({
    id: generateId(),
    key,
    value,
    enabled: true,
  }));
}

function parseUrlParts(url: string): { base: string; params: KeyValuePair[] } {
  try {
    const parsed = new URL(url);
    const params: KeyValuePair[] = [];
    parsed.searchParams.forEach((value, key) => {
      params.push({ id: generateId(), key, value, enabled: true });
    });
    parsed.search = '';
    return {
      base: parsed.toString(),
      params: params.length ? params : [{ id: generateId(), key: '', value: '', enabled: true }],
    };
  } catch {
    return { base: url, params: [{ id: generateId(), key: '', value: '', enabled: true }] };
  }
}

export function parseCurl(curlCommand: string): ParsedCurl {
  const tokens = tokenizeCurl(curlCommand);
  let method: HttpMethod = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  let bodyContent = '';
  let bodyType: ApiRequest['body']['type'] = 'raw';
  let auth = createDefaultAuth();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const next = tokens[i + 1];

    if (token === '-X' || token === '--request') {
      method = (next?.toUpperCase() ?? 'GET') as HttpMethod;
      i++;
      continue;
    }
    if (token === '-H' || token === '--header') {
      const header = next ?? '';
      const colon = header.indexOf(':');
      if (colon > 0) {
        const key = header.slice(0, colon).trim();
        const value = header.slice(colon + 1).trim();
        headers[key] = value;
        if (key.toLowerCase() === 'authorization' && value.toLowerCase().startsWith('bearer ')) {
          auth = { type: 'bearer', bearerToken: value.slice(7).trim() };
        }
      }
      i++;
      continue;
    }
    if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
      bodyContent = next ?? '';
      bodyType = headers['Content-Type']?.includes('json') ? 'json' : 'raw';
      if (!method || method === 'GET') method = 'POST';
      i++;
      continue;
    }
    if (token === '--json') {
      bodyContent = next ?? '';
      bodyType = 'json';
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
      if (method === 'GET') method = 'POST';
      i++;
      continue;
    }
    if (token === '-u' || token === '--user') {
      const creds = next ?? '';
      const [username, password = ''] = creds.split(':');
      auth = { type: 'basic', basicUsername: username, basicPassword: password };
      i++;
      continue;
    }
    if (token.startsWith('http://') || token.startsWith('https://')) {
      url = token;
      continue;
    }
    if (!token.startsWith('-') && !url && (token.includes('.') || token.includes('localhost'))) {
      url = token.startsWith('//') ? `https:${token}` : token;
    }
  }

  const { base, params } = parseUrlParts(url);
  const body = createDefaultBody(bodyType);
  body.content = bodyContent;
  if (bodyType === 'json' && bodyContent && !bodyContent.trim().startsWith('{')) {
    body.type = 'raw';
  }

  return {
    method,
    url: base,
    headers: toKeyValues(headers),
    body,
    auth,
    params,
  };
}

export function curlToRequest(curlCommand: string, name = 'Imported Request'): ApiRequest {
  const parsed = parseCurl(curlCommand);
  const req = createDefaultRequest(name);
  return {
    ...req,
    method: parsed.method,
    url: parsed.url,
    params: parsed.params,
    headers: parsed.headers,
    body: parsed.body,
    auth: parsed.auth,
  };
}
