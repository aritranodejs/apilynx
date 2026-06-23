import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApiRequest, AuthConfig, BodyType, HttpMethod, KeyValuePair } from '@/types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function createEmptyKeyValue(): KeyValuePair {
  return { id: generateId(), key: '', value: '', enabled: true };
}

export function createDefaultAuth(): AuthConfig {
  return { type: 'none' };
}

export function createDefaultBody(type: BodyType = 'json'): ApiRequest['body'] {
  return {
    type,
    content: type === 'json' ? '{\n  \n}' : '',
    formData: [createEmptyKeyValue()],
  };
}

export function createDefaultRequest(name = 'Untitled Request'): ApiRequest {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    method: 'GET',
    url: '',
    params: [createEmptyKeyValue()],
    headers: [createEmptyKeyValue()],
    body: createDefaultBody(),
    auth: createDefaultAuth(),
    createdAt: now,
    updatedAt: now,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-400';
  if (status >= 300 && status < 400) return 'text-amber-400';
  if (status >= 400 && status < 500) return 'text-orange-400';
  if (status >= 500) return 'text-red-400';
  return 'text-zinc-400';
}

export function buildUrlWithParams(baseUrl: string, params: KeyValuePair[]): string {
  if (!baseUrl) return '';
  try {
    const url = new URL(baseUrl.includes('://') ? baseUrl : `http://${baseUrl}`);
    params
      .filter((p) => p.enabled && p.key.trim())
      .forEach((p) => url.searchParams.set(p.key.trim(), p.value));
    return url.toString();
  } catch {
    const enabled = params.filter((p) => p.enabled && p.key.trim());
    if (enabled.length === 0) return baseUrl;
    const query = enabled
      .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`)
      .join('&');
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${query}`;
  }
}

export function substituteVariables(
  text: string,
  variables: Record<string, string>
): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
    const trimmed = key.trim();
    return variables[trimmed] ?? `{{${trimmed}}}`;
  });
}

export function applyAuthToHeaders(
  auth: AuthConfig,
  headers: Record<string, string>
): Record<string, string> {
  const result = { ...headers };
  switch (auth.type) {
    case 'bearer':
      if (auth.bearerToken) {
        result['Authorization'] = `Bearer ${auth.bearerToken}`;
      }
      break;
    case 'basic':
      if (auth.basicUsername !== undefined) {
        const encoded = btoa(`${auth.basicUsername}:${auth.basicPassword ?? ''}`);
        result['Authorization'] = `Basic ${encoded}`;
      }
      break;
    case 'api-key':
      if (auth.apiKeyKey && auth.apiKeyValue && auth.apiKeyAddTo === 'header') {
        result[auth.apiKeyKey] = auth.apiKeyValue;
      }
      break;
    default:
      break;
  }
  return result;
}

export function applyAuthToUrl(url: string, auth: AuthConfig): string {
  if (auth.type !== 'api-key' || auth.apiKeyAddTo !== 'query') return url;
  if (!auth.apiKeyKey || !auth.apiKeyValue) return url;
  try {
    const parsed = new URL(url.includes('://') ? url : `http://${url}`);
    parsed.searchParams.set(auth.apiKeyKey, auth.apiKeyValue);
    return parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${encodeURIComponent(auth.apiKeyKey)}=${encodeURIComponent(auth.apiKeyValue)}`;
  }
}

export function headersFromKeyValues(pairs: KeyValuePair[]): Record<string, string> {
  const headers: Record<string, string> = {};
  pairs
    .filter((p) => p.enabled && p.key.trim())
    .forEach((p) => {
      headers[p.key.trim()] = p.value;
    });
  return headers;
}

export function isValidJson(str: string): { valid: boolean; error?: string } {
  if (!str.trim()) return { valid: true };
  try {
    JSON.parse(str);
    return { valid: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    return { valid: false, error: message };
  }
}

export function prettyJson(str: string): string {
  return JSON.stringify(JSON.parse(str), null, 2);
}

export function minifyJson(str: string): string {
  return JSON.stringify(JSON.parse(str));
}

export function methodAllowsBody(method: HttpMethod): boolean {
  return method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
}

/** Ensure URLs have a protocol so requests work when users omit https:// */
export function normalizeRequestUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function methodColor(method: HttpMethod): string {
  const colors: Record<HttpMethod, string> = {
    GET: 'text-emerald-400',
    POST: 'text-amber-400',
    PUT: 'text-blue-400',
    PATCH: 'text-purple-400',
    DELETE: 'text-red-400',
    HEAD: 'text-cyan-400',
    OPTIONS: 'text-pink-400',
  };
  return colors[method];
}

export function sanitizeForDisplay(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
