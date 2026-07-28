import type { ApiRequest, AuthConfig, RequestTest, RunnerResult } from '@/types';
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
  prepareAuthForRequest,
  substituteVariables,
} from '@/lib/utils';
import { buildRequestBodyPayload } from '@/lib/request-body';
import { buildFormDataFromEntries } from '@/lib/form-body';
import { isElectronApp } from '@/services/ipc';
import type { SendRequestPayload } from '@/types';

export async function runCollectionRequests(
  requests: ApiRequest[],
  variables: Record<string, string>,
  timeout: number,
  delayMs = 0,
  options?: { collectionAuth?: AuthConfig; environmentAuth?: AuthConfig }
): Promise<RunnerResult[]> {
  const results: RunnerResult[] = [];

  for (const request of requests) {
    if (delayMs > 0) await sleep(delayMs);

    const auth = prepareAuthForRequest(request.auth, variables, {
      collectionAuth: options?.collectionAuth,
      environmentAuth: options?.environmentAuth,
    });

    let url = normalizeRequestUrl(substituteVariables(request.url, variables));
    url = buildUrlWithParams(
      url,
      request.params.map((p) => ({
        ...p,
        key: substituteVariables(p.key, variables),
        value: substituteVariables(p.value, variables),
      }))
    );
    url = applyAuthToUrl(url, auth);

    const headers = applyAuthToHeaders(
      auth,
      headersFromKeyValues(
        request.headers.map((h) => ({
          ...h,
          key: substituteVariables(h.key, variables),
          value: substituteVariables(h.value, variables),
        }))
      )
    );

    const formPairs = request.body.formData.map((p) => ({
      ...p,
      key: substituteVariables(p.key, variables),
      value: substituteVariables(p.value, variables),
    }));

    const bodyContent = substituteVariables(request.body.content, variables);
    const built = methodAllowsBody(request.method)
      ? buildRequestBodyPayload(request.body.type, bodyContent, formPairs)
      : { bodyType: request.body.type };
    const { body, bodyType, formEntries } = built;

    const payloadHeaders = { ...headers };
    if (bodyType === 'form-data') {
      delete payloadHeaders['Content-Type'];
    } else if (
      (bodyType === 'json' || request.body.type === 'graphql') &&
      !payloadHeaders['Content-Type']
    ) {
      payloadHeaders['Content-Type'] = 'application/json';
    } else if (bodyType === 'x-www-form-urlencoded' && !payloadHeaders['Content-Type']) {
      payloadHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    let requestBody: SendRequestPayload['body'] = body;
    if (!isElectronApp() && bodyType === 'form-data' && formEntries?.length) {
      requestBody = buildFormDataFromEntries(formEntries);
    }

    const payload: SendRequestPayload = {
      method: request.method,
      url,
      headers: payloadHeaders,
      body: requestBody,
      formEntries,
      bodyType,
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
