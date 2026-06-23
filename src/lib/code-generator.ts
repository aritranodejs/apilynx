import type { ApiRequest, CodeLanguage } from '@/types';
import { buildUrlWithParams, headersFromKeyValues } from '@/lib/utils';

interface GenerateOptions {
  request: ApiRequest;
  resolvedUrl: string;
}

function escapeSingleQuote(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escapeDoubleQuote(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function generateCode(language: CodeLanguage, options: GenerateOptions): string {
  const { request, resolvedUrl } = options;
  const headers = headersFromKeyValues(request.headers);
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(request.method) && request.body.content;

  switch (language) {
    case 'javascript-fetch':
      return generateFetch(resolvedUrl, request.method, headers, hasBody ? request.body.content : undefined);
    case 'axios':
      return generateAxios(resolvedUrl, request.method, headers, hasBody ? request.body.content : undefined);
    case 'nodejs':
      return generateNodeFetch(resolvedUrl, request.method, headers, hasBody ? request.body.content : undefined);
    case 'curl':
      return generateCurl(resolvedUrl, request.method, headers, hasBody ? request.body.content : undefined);
    case 'php-curl':
      return generatePhpCurl(resolvedUrl, request.method, headers, hasBody ? request.body.content : undefined);
    case 'laravel':
      return generateLaravel(resolvedUrl, request.method, headers, hasBody ? request.body.content : undefined);
    case 'python':
      return generatePython(resolvedUrl, request.method, headers, hasBody ? request.body.content : undefined);
    case 'java-okhttp':
      return generateJavaOkHttp(resolvedUrl, request.method, headers, hasBody ? request.body.content : undefined);
    default:
      return '';
  }
}

function generateCurl(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): string {
  const headerFlags = Object.entries(headers)
    .map(([k, v]) => `  -H "${escapeDoubleQuote(k)}: ${escapeDoubleQuote(v)}" \\`)
    .join('\n');

  const bodyFlag = body ? `\n  -d '${escapeSingleQuote(body)}' \\` : '';

  return `curl -X ${method} \\
${headerFlags || '  -H "Content-Type: application/json" \\'}${bodyFlag}
  "${escapeDoubleQuote(url)}"`;
}

function generateFetch(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): string {
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `    '${escapeSingleQuote(k)}': '${escapeSingleQuote(v)}',`)
    .join('\n');

  const bodyLine = body
    ? `\n  body: JSON.stringify(${body.trim().startsWith('{') ? body : `'${escapeSingleQuote(body)}'`}),`
    : '';

  return `const response = await fetch('${escapeSingleQuote(url)}', {
  method: '${method}',
  headers: {
${headerLines || "    'Content-Type': 'application/json',"}
  },${bodyLine}
});

const data = await response.json();
console.log(data);`;
}

function generateAxios(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): string {
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `    '${escapeSingleQuote(k)}': '${escapeSingleQuote(v)}',`)
    .join('\n');

  const dataLine = body ? `\n  data: ${body.trim().startsWith('{') ? body : `'${escapeSingleQuote(body)}'`},` : '';

  return `import axios from 'axios';

const response = await axios({
  method: '${method.toLowerCase()}',
  url: '${escapeSingleQuote(url)}',
  headers: {
${headerLines || "    'Content-Type': 'application/json',"}
  },${dataLine}
});

console.log(response.data);`;
}

function generateNodeFetch(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): string {
  return `const https = require('https');
const http = require('http');

const url = new URL('${escapeSingleQuote(url)}');
const client = url.protocol === 'https:' ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname + url.search,
  method: '${method}',
  headers: ${JSON.stringify(headers, null, 2)},
};

const req = client.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(data); });
});

${body ? `req.write(${JSON.stringify(body)});\n` : ''}req.end();`;
}

function generatePhpCurl(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): string {
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `    "${escapeDoubleQuote(k)}: ${escapeDoubleQuote(v)}",`)
    .join('\n');

  return `<?php

$ch = curl_init('${escapeSingleQuote(url)}');
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
${headerLines}
]);
${body ? `curl_setopt($ch, CURLOPT_POSTFIELDS, '${escapeSingleQuote(body)}');\n` : ''}
$response = curl_exec($ch);
curl_close($ch);

echo $response;`;
}

function generateLaravel(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): string {
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `        '${escapeSingleQuote(k)}' => '${escapeSingleQuote(v)}',`)
    .join('\n');

  const bodyData = body && body.trim().startsWith('{')
    ? body
    : body
      ? `'${escapeSingleQuote(body)}'`
      : '[]';

  return `use Illuminate\\Support\\Facades\\Http;

$response = Http::withHeaders([
${headerLines}
})->${method.toLowerCase()}('${escapeSingleQuote(url)}'${body ? `, ${bodyData}` : ''});

return $response->json();`;
}

function generatePython(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): string {
  return `import requests

headers = ${JSON.stringify(headers, null, 4)}
${body ? `payload = ${body.trim().startsWith('{') ? body : JSON.stringify(body)}\n` : ''}
response = requests.${method.toLowerCase()}(
    '${escapeSingleQuote(url)}',
    headers=headers,${body ? '\n    json=payload,' : ''}
)

print(response.json())`;
}

function generateJavaOkHttp(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): string {
  const headerLines = Object.entries(headers)
    .map(([k, v]) => `        .addHeader("${escapeDoubleQuote(k)}", "${escapeDoubleQuote(v)}")`)
    .join('\n');

  const bodyBlock = body
    ? `\nRequestBody requestBody = RequestBody.create(
    ${JSON.stringify(body)},
    MediaType.parse("application/json")
);\n`
    : '';

  const bodyArg = body ? ', requestBody' : '';

  return `import okhttp3.*;

${bodyBlock}
OkHttpClient client = new OkHttpClient();

Request request = new Request.Builder()
    .url("${escapeDoubleQuote(url)}")
${headerLines}
    .${method === 'GET' ? 'get' : method.toLowerCase()}()${bodyArg}
    .build();

try (Response response = client.newCall(request).execute()) {
    System.out.println(response.body().string());
}`;
}

export function getResolvedUrlForCodegen(request: ApiRequest): string {
  return buildUrlWithParams(request.url, request.params);
}
