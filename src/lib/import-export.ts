import type { ApiRequest, Collection, HttpMethod } from '@/types';
import { createDefaultRequest, generateId } from '@/lib/utils';

interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  info?: { title?: string; description?: string };
  paths?: Record<
    string,
    Record<string, { summary?: string; description?: string; parameters?: unknown[]; requestBody?: unknown }>
  >;
}

export function importOpenApi(spec: OpenAPISpec): { collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>; requests: ApiRequest[] } {
  const name = spec.info?.title ?? 'Imported API';
  const description = spec.info?.description;
  const requests: ApiRequest[] = [];

  if (!spec.paths) throw new Error('Invalid OpenAPI spec: missing paths');

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (method === 'parameters') continue;
      const m = method.toUpperCase() as HttpMethod;
      const req = createDefaultRequest(op.summary ?? `${m} ${path}`);
      req.method = m;
      req.url = path;
      req.description = op.description;
      if (op.requestBody) {
        req.body.content = '{\n  \n}';
        req.body.type = 'json';
      }
      requests.push(req);
    }
  }

  return {
    collection: {
      name,
      description,
      folders: [],
      requestIds: requests.map((r) => r.id),
    },
    requests,
  };
}

export function exportOpenApi(collection: Collection, requests: ApiRequest[]): object {
  const paths: Record<string, Record<string, object>> = {};

  for (const req of requests) {
    const pathKey = req.url.split('?')[0] || '/';
    const method = req.method.toLowerCase();
    if (!paths[pathKey]) paths[pathKey] = {};
    paths[pathKey][method] = {
      summary: req.name,
      description: req.description,
      ...(req.body.content && req.body.type === 'json'
        ? {
            requestBody: {
              content: { 'application/json': { example: tryParseJson(req.body.content) } },
            },
          }
        : {}),
    };
  }

  return {
    openapi: '3.0.3',
    info: {
      title: collection.name,
      description: collection.description ?? '',
      version: '1.0.0',
    },
    paths,
  };
}

function tryParseJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

interface PostmanItem {
  name: string;
  request?: {
    method?: string;
    url?: string | { raw?: string };
    header?: { key: string; value: string; disabled?: boolean }[];
    body?: { mode?: string; raw?: string };
    description?: string;
  };
  item?: PostmanItem[];
}

interface PostmanCollection {
  info?: { name?: string; description?: string };
  item?: PostmanItem[];
}

export function importPostmanCollection(data: PostmanCollection): {
  collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>;
  requests: ApiRequest[];
} {
  const name = data.info?.name ?? 'Imported Postman Collection';
  const description = data.info?.description;
  const requests: ApiRequest[] = [];

  function walk(items: PostmanItem[] | undefined) {
    if (!items) return;
    for (const item of items) {
      if (item.item) {
        walk(item.item);
        continue;
      }
      const pr = item.request;
      if (!pr) continue;
      const req = createDefaultRequest(item.name);
      req.method = (pr.method?.toUpperCase() ?? 'GET') as HttpMethod;
      req.url =
        typeof pr.url === 'string' ? pr.url : (pr.url?.raw ?? '');
      req.description = typeof pr.description === 'string' ? pr.description : undefined;
      if (pr.header) {
        req.headers = pr.header.map((h) => ({
          id: generateId(),
          key: h.key,
          value: h.value,
          enabled: !h.disabled,
        }));
      }
      if (pr.body?.raw) {
        req.body.content = pr.body.raw;
        req.body.type = pr.body.mode === 'raw' ? 'raw' : 'json';
      }
      requests.push(req);
    }
  }

  walk(data.item);

  return {
    collection: { name, description, folders: [], requestIds: requests.map((r) => r.id) },
    requests,
  };
}
