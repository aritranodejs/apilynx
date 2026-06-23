import type { ApiRequest, RequestTest, RunnerResult } from '@/types';
import { runRequestTests } from '@/lib/docs-generator';
import { httpService } from '@/services/ipc';
import {
  applyAuthToHeaders,
  applyAuthToUrl,
  buildUrlWithParams,
  generateId,
  headersFromKeyValues,
  methodAllowsBody,
  normalizeRequestUrl,
  substituteVariables,
} from '@/lib/utils';
import type { SendRequestPayload } from '@/types';

export async function runCollectionRequests(
  requests: ApiRequest[],
  variables: Record<string, string>,
  timeout: number,
  delayMs = 0
): Promise<RunnerResult[]> {
  const results: RunnerResult[] = [];

  for (const request of requests) {
    if (delayMs > 0) await sleep(delayMs);

    let url = normalizeRequestUrl(substituteVariables(request.url, variables));
    url = buildUrlWithParams(
      url,
      request.params.map((p) => ({
        ...p,
        key: substituteVariables(p.key, variables),
        value: substituteVariables(p.value, variables),
      }))
    );
    url = applyAuthToUrl(url, request.auth);

    const headers = applyAuthToHeaders(
      request.auth,
      headersFromKeyValues(
        request.headers.map((h) => ({
          ...h,
          key: substituteVariables(h.key, variables),
          value: substituteVariables(h.value, variables),
        }))
      )
    );

    let body: string | undefined;
    if (methodAllowsBody(request.method)) {
      if (request.body.type === 'graphql') {
        body = request.body.content;
        headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
      } else if (request.body.content) {
        body = substituteVariables(request.body.content, variables);
      }
    }

    const payload: SendRequestPayload = {
      method: request.method,
      url,
      headers,
      body,
      bodyType: request.body.type === 'graphql' ? 'json' : request.body.type,
      timeout,
      signalId: generateId(),
    };

    try {
      const response = await httpService.send(payload);
      const testResults = runRequestTests(request.tests, response);
      const passed = testResults.length === 0 || testResults.every((t) => t.passed);
      results.push({
        requestId: request.id,
        requestName: request.name,
        method: request.method,
        url,
        status: response.status,
        duration: response.duration,
        passed: passed && response.status > 0,
        testResults,
      });
    } catch (e) {
      results.push({
        requestId: request.id,
        requestName: request.name,
        method: request.method,
        url,
        status: 0,
        duration: 0,
        passed: false,
        testResults: [],
        error: e instanceof Error ? e.message : 'Request failed',
      });
    }
  }

  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function createDefaultTests(): RequestTest[] {
  return [
    {
      id: generateId(),
      name: 'Status is 200',
      type: 'status',
      expected: '200',
      enabled: true,
    },
  ];
}
