import type { ApiRequest, ApiResponse, Collection, RequestTest } from '@/types';

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

export function generateCollectionDocs(
  collection: Collection,
  requests: ApiRequest[],
  baseUrl = ''
): string {
  const now = new Date().toLocaleString();
  const requestSections = requests
    .map((req) => {
      const headers = req.headers
        .filter((h) => h.enabled && h.key)
        .map((h) => `<tr><td><code>${escapeHtml(h.key)}</code></td><td><code>${escapeHtml(h.value)}</code></td></tr>`)
        .join('');
      const params = req.params
        .filter((p) => p.enabled && p.key)
        .map((p) => `<tr><td><code>${escapeHtml(p.key)}</code></td><td>${escapeHtml(p.value)}</td></tr>`)
        .join('');
      const body =
        req.body.type !== 'form-data' && req.body.content
          ? `<pre><code>${escapeHtml(req.body.content)}</code></pre>`
          : '<p><em>No body</em></p>';
      const tests = (req.tests ?? [])
        .filter((t) => t.enabled)
        .map((t) => `<li>${escapeHtml(t.name)} — ${t.type}: ${escapeHtml(t.expected)}</li>`)
        .join('');
      const example = req.exampleResponse
        ? `<h4>Example response</h4><pre><code>${escapeHtml(req.exampleResponse)}</code></pre>`
        : '';

      return `
      <section class="endpoint" id="${req.id}">
        <h2><span class="method method-${req.method.toLowerCase()}">${req.method}</span> ${escapeHtml(req.name)}</h2>
        <p class="url"><code>${escapeHtml(req.url)}</code></p>
        ${req.description ? `<p class="desc">${escapeHtml(req.description)}</p>` : ''}
        ${params ? `<h4>Query params</h4><table><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>${params}</tbody></table>` : ''}
        ${headers ? `<h4>Headers</h4><table><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>${headers}</tbody></table>` : ''}
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
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; width: 100%; max-width: 960px; margin: 0 auto; padding: 1rem 1.25rem 2rem; background: #09090b; color: #e4e4e7; line-height: 1.6; font-size: 14px; }
    @media (min-width: 640px) { body { padding: 1.5rem 2rem 2.5rem; } }
    h1 { color: #f97316; border-bottom: 1px solid #27272a; padding-bottom: 0.5rem; }
    .meta { color: #71717a; font-size: 0.875rem; margin-bottom: 2rem; }
    .endpoint { margin: 2rem 0; padding: 1.5rem; background: #18181b; border-radius: 8px; border: 1px solid #27272a; }
    .method { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; margin-right: 0.5rem; }
    .method-get { background: #166534; color: #bbf7d0; }
    .method-post { background: #1e40af; color: #bfdbfe; }
    .method-put { background: #92400e; color: #fde68a; }
    .method-patch { background: #7c2d12; color: #fed7aa; }
    .method-delete { background: #991b1b; color: #fecaca; }
    .url { word-break: break-all; }
    table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 0.875rem; }
    th, td { border: 1px solid #27272a; padding: 0.5rem; text-align: left; }
    th { background: #27272a; }
    pre { background: #09090b; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; }
    code { font-family: ui-monospace, monospace; }
    .desc { color: #a1a1aa; }
    .toc { background: #18181b; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
    .toc a { color: #f97316; text-decoration: none; }
    .toc li { margin: 0.25rem 0; }
    footer { margin-top: 3rem; text-align: center; color: #52525b; font-size: 0.75rem; }
  </style>
</head>
<body>
  <h1>${escapeHtml(collection.name)}</h1>
  <p class="meta">Generated by Apilynx · ${now}${baseUrl ? ` · Base: ${escapeHtml(baseUrl)}` : ''}</p>
  ${collection.description ? `<p>${escapeHtml(collection.description)}</p>` : ''}
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
