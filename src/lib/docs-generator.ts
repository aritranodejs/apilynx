import type { ApiRequest, ApiResponse, Collection, RequestTest } from '@/types';
import { applyAuthToHeaders, headersFromKeyValues } from '@/lib/utils';

export function runRequestTests(
  tests: RequestTest[] | undefined,
  response: ApiResponse
): { name: string; passed: boolean; message: string }[] {
  if (!tests?.length) return [];
  return tests
    .filter((t) => t.enabled)
    .map((test) => {
      switch (test.type) {
        case 'status': {
          const expected = parseInt(test.expected, 10);
          const passed = response.status === expected;
          return {
            name: test.name,
            passed,
            message: passed
              ? `Status is ${response.status}`
              : `Expected status ${expected}, got ${response.status}`,
          };
        }
        case 'body_contains': {
          const passed = response.body.includes(test.expected);
          return {
            name: test.name,
            passed,
            message: passed
              ? `Body contains "${test.expected}"`
              : `Body does not contain "${test.expected}"`,
          };
        }
        case 'response_time': {
          const maxMs = parseInt(test.expected, 10);
          const passed = response.duration <= maxMs;
          return {
            name: test.name,
            passed,
            message: passed
              ? `Response time ${response.duration}ms ≤ ${maxMs}ms`
              : `Response time ${response.duration}ms exceeds ${maxMs}ms`,
          };
        }
        default:
          return { name: test.name, passed: false, message: 'Unknown test type' };
      }
    });
}

const DOC_STYLES = `
  * { box-sizing: border-box; }
  html { overflow-x: hidden; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 1.25rem 1.5rem 4rem;
    background: #09090b;
    color: #e4e4e7;
    line-height: 1.6;
    font-size: 14px;
    overflow-x: hidden;
  }
  h1 {
    color: #f97316;
    border-bottom: 1px solid #3f3f46;
    padding-bottom: 0.75rem;
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
  }
  .meta { color: #a1a1aa; font-size: 0.8rem; margin-bottom: 1.5rem; }
  .collection-desc { color: #d4d4d8; margin-bottom: 1.5rem; }
  .toc {
    background: #18181b;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    border: 1px solid #3f3f46;
  }
  .toc strong { color: #fafafa; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
  .toc ul { margin: 0.5rem 0 0; padding-left: 1.25rem; }
  .toc a { color: #fb923c; text-decoration: none; word-break: break-word; }
  .toc a:hover { text-decoration: underline; }
  .toc li { margin: 0.35rem 0; }
  .endpoint {
    margin: 1.5rem 0;
    padding: 1.25rem 1.5rem;
    background: #18181b;
    border-radius: 10px;
    border: 1px solid #3f3f46;
    overflow: hidden;
  }
  .endpoint h2 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.75rem;
    font-size: 1.15rem;
    line-height: 1.4;
  }
  .method {
    display: inline-block;
    padding: 0.2rem 0.55rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .method-get { background: #166534; color: #bbf7d0; }
  .method-post { background: #1e40af; color: #bfdbfe; }
  .method-put { background: #92400e; color: #fde68a; }
  .method-patch { background: #7c2d12; color: #fed7aa; }
  .method-delete { background: #991b1b; color: #fecaca; }
  .url {
    word-break: break-all;
    overflow-wrap: anywhere;
    margin: 0 0 0.75rem;
    padding: 0.65rem 0.75rem;
    background: #09090b;
    border-radius: 6px;
    border: 1px solid #27272a;
  }
  .url code { font-size: 0.8rem; color: #fdba74; white-space: pre-wrap; word-break: break-all; }
  h4 {
    margin: 1.25rem 0 0.5rem;
    color: #a1a1aa;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .table-wrap {
    overflow: hidden;
    max-width: 100%;
    margin: 0.25rem 0 0.75rem;
    border-radius: 8px;
    border: 1px solid #3f3f46;
  }
  table { width: 100%; max-width: 100%; border-collapse: collapse; font-size: 0.8rem; table-layout: fixed; }
  th, td {
    border-bottom: 1px solid #27272a;
    padding: 0.6rem 0.75rem;
    text-align: left;
    vertical-align: top;
    overflow: hidden;
  }
  tr:last-child td { border-bottom: none; }
  th { background: #27272a; color: #fafafa; font-weight: 600; }
  th:first-child, td:first-child { width: 28%; }
  th:last-child, td:last-child { width: 72%; max-width: 0; }
  td.key code { color: #fdba74; font-size: 0.75rem; }
  td.value { color: #e4e4e7; }
  td.value code, td.value .val {
    display: block;
    font-family: ui-monospace, monospace;
    font-size: 0.72rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
    max-width: 100%;
  }
  .masked { color: #a1a1aa; font-style: italic; }
  pre {
    background: #09090b;
    padding: 0.85rem 1rem;
    border-radius: 8px;
    border: 1px solid #27272a;
    overflow-x: auto;
    font-size: 0.75rem;
    margin: 0.25rem 0 0;
    max-width: 100%;
  }
  pre code {
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
    font-family: ui-monospace, monospace;
  }
  .desc { color: #a1a1aa; margin-bottom: 0.5rem; }
  ul { margin: 0.25rem 0; padding-left: 1.25rem; color: #d4d4d8; }
  footer {
    margin-top: 2.5rem;
    padding: 1.5rem 0;
    text-align: center;
    color: #71717a;
    font-size: 0.8rem;
    border-top: 1px solid #27272a;
  }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: #52525b; border-radius: 4px; }
  ::-webkit-scrollbar-track { background: #18181b; }
`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Mask secrets in published docs; keeps layout readable. */
function formatDocValue(key: string, value: string): { display: string; masked: boolean } {
  const k = key.toLowerCase().trim();
  const isSecret =
    k === 'authorization' ||
    k === 'x-api-key' ||
    k.includes('token') ||
    k.includes('secret') ||
    k.includes('api-key') ||
    k.includes('apikey') ||
    k === 'cookie' ||
    k === 'set-cookie';

  if (!isSecret && value.length <= 64) {
    return { display: value, masked: false };
  }

  if (/^bearer\s+/i.test(value)) {
    const token = value.replace(/^bearer\s+/i, '');
    const preview = token.length > 12 ? `${token.slice(0, 6)}…${token.slice(-4)}` : '••••';
    return { display: `Bearer ${preview}`, masked: true };
  }
  if (/^basic\s+/i.test(value)) {
    return { display: 'Basic ••••••••', masked: true };
  }
  if (isSecret || value.length > 64) {
    return {
      display: value.length > 16 ? `${value.slice(0, 6)}…${value.slice(-4)}` : '••••••••',
      masked: true,
    };
  }

  return { display: value, masked: false };
}

function getDocHeaders(req: ApiRequest): { key: string; value: string }[] {
  const merged = applyAuthToHeaders(
    req.auth,
    headersFromKeyValues(req.headers.filter((h) => h.enabled && h.key))
  );
  return Object.entries(merged).map(([key, value]) => ({ key, value }));
}

function tableRow(key: string, value: string): string {
  const { display, masked } = formatDocValue(key, value);
  const cls = masked ? 'val masked' : 'val';
  return `<tr>
    <td class="key"><code>${escapeHtml(key)}</code></td>
    <td class="value"><span class="${cls}">${escapeHtml(display)}</span>${masked ? ' <small>(masked in docs)</small>' : ''}</td>
  </tr>`;
}

function tableSection(title: string, rows: string): string {
  if (!rows) return '';
  return `<h4>${title}</h4>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Key</th><th>Value</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

export function generateCollectionDocs(
  collection: Collection,
  requests: ApiRequest[],
  baseUrl = ''
): string {
  const now = new Date().toLocaleString();
  const requestSections = requests
    .map((req) => {
      const headers = getDocHeaders(req)
        .map((h) => tableRow(h.key, h.value))
        .join('');
      const params = req.params
        .filter((p) => p.enabled && p.key)
        .map((p) => tableRow(p.key, p.value))
        .join('');
      const body =
        req.body.type !== 'form-data' && req.body.content
          ? `<pre><code>${escapeHtml(req.body.content)}</code></pre>`
          : '<p class="desc"><em>No body</em></p>';
      const tests = (req.tests ?? [])
        .filter((t) => t.enabled)
        .map((t) => `<li>${escapeHtml(t.name)} — ${t.type}: ${escapeHtml(t.expected)}</li>`)
        .join('');
      const example = req.exampleResponse
        ? `<h4>Example response</h4><pre><code>${escapeHtml(req.exampleResponse)}</code></pre>`
        : '';

      return `
      <section class="endpoint" id="${req.id}">
        <h2><span class="method method-${req.method.toLowerCase()}">${req.method}</span><span>${escapeHtml(req.name)}</span></h2>
        <p class="url"><code>${escapeHtml(req.url)}</code></p>
        ${req.description ? `<p class="desc">${escapeHtml(req.description)}</p>` : ''}
        ${tableSection('Query params', params)}
        ${tableSection('Headers', headers)}
        <h4>Body (${req.body.type})</h4>${body}
        ${tests ? `<h4>Tests</h4><ul>${tests}</ul>` : ''}
        ${example}
      </section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(collection.name)} — API Documentation</title>
  <style>${DOC_STYLES}</style>
</head>
<body>
  <h1>${escapeHtml(collection.name)}</h1>
  <p class="meta">Generated by Apilynx · ${escapeHtml(now)}${baseUrl ? ` · Base: ${escapeHtml(baseUrl)}` : ''}</p>
  ${collection.description ? `<p class="collection-desc">${escapeHtml(collection.description)}</p>` : ''}
  <nav class="toc">
    <strong>Endpoints</strong>
    <ul>
      ${requests.map((r) => `<li><a href="#${r.id}">${r.method} ${escapeHtml(r.name)}</a></li>`).join('')}
    </ul>
  </nav>
  ${requestSections}
  <footer>Developed By Aritra Dutta · Apilynx API Documentation</footer>
</body>
</html>`;
}

export function downloadHtml(filename: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
