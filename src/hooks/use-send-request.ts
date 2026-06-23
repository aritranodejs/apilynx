'use client';

import { useCallback, useRef } from 'react';
import { useTabsStore } from '@/stores/tabs-store';
import { useEnvironmentStore } from '@/stores/environment-store';
import { useSettingsStore } from '@/stores/settings-store';
import { httpService, historyService, requestService } from '@/services/ipc';
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
import type { BodyType, KeyValuePair, SendRequestPayload } from '@/types';

function substituteInPairs(pairs: KeyValuePair[], vars: Record<string, string>): KeyValuePair[] {
  return pairs.map((p) => ({
    ...p,
    key: substituteVariables(p.key, vars),
    value: substituteVariables(p.value, vars),
  }));
}

function buildRequestBody(
  bodyType: BodyType,
  content: string,
  formData: KeyValuePair[]
): { body?: string; bodyType: BodyType } {
  switch (bodyType) {
    case 'json':
    case 'raw':
    case 'graphql':
      return { body: content, bodyType: bodyType === 'graphql' ? 'json' : bodyType };
    case 'x-www-form-urlencoded': {
      const params = new URLSearchParams();
      formData
        .filter((p) => p.enabled && p.key.trim())
        .forEach((p) => params.set(p.key.trim(), p.value));
      return { body: params.toString(), bodyType: 'x-www-form-urlencoded' };
    }
    case 'form-data':
      return { bodyType: 'form-data' };
    default:
      return { bodyType };
  }
}

export function useSendRequest() {
  const signalRef = useRef<string | null>(null);
  const { setTabLoading, setTabResponse, setTabDuration, getActiveTab } = useTabsStore();
  const getVariablesMap = useEnvironmentStore((s) => s.getVariablesMap);
  const timeout = useSettingsStore((s) => s.timeout);
  const autoSave = useSettingsStore((s) => s.autoSave);

  const send = useCallback(
    async (tabId: string) => {
      const tab = useTabsStore.getState().tabs.find((t) => t.id === tabId);
      if (!tab) return;

      const vars = getVariablesMap();
      const request = tab.request;

      let url = normalizeRequestUrl(substituteVariables(request.url, vars));
      url = buildUrlWithParams(url, substituteInPairs(request.params, vars));
      url = applyAuthToUrl(url, {
        ...request.auth,
        bearerToken: request.auth.bearerToken
          ? substituteVariables(request.auth.bearerToken, vars)
          : undefined,
        apiKeyValue: request.auth.apiKeyValue
          ? substituteVariables(request.auth.apiKeyValue, vars)
          : undefined,
      });

      const headers = applyAuthToHeaders(
        {
          ...request.auth,
          bearerToken: request.auth.bearerToken
            ? substituteVariables(request.auth.bearerToken, vars)
            : undefined,
          basicUsername: request.auth.basicUsername
            ? substituteVariables(request.auth.basicUsername, vars)
            : undefined,
          basicPassword: request.auth.basicPassword
            ? substituteVariables(request.auth.basicPassword, vars)
            : undefined,
          apiKeyValue: request.auth.apiKeyValue
            ? substituteVariables(request.auth.apiKeyValue, vars)
            : undefined,
        },
        headersFromKeyValues(substituteInPairs(request.headers, vars))
      );

      if (methodAllowsBody(request.method)) {
        if ((request.body.type === 'json' || request.body.type === 'graphql') && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
        if (request.body.type === 'x-www-form-urlencoded' && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      const bodyContent = substituteVariables(request.body.content, vars);
      const formPairs = substituteInPairs(request.body.formData, vars);
      const built = methodAllowsBody(request.method)
        ? buildRequestBody(request.body.type, bodyContent, formPairs)
        : { bodyType: request.body.type as BodyType };
      const { body, bodyType } = built;

      const signalId = generateId();
      signalRef.current = signalId;

      setTabLoading(tabId, true);
      setTabResponse(tabId, undefined);

      const payload: SendRequestPayload = {
        method: request.method,
        url,
        headers,
        body,
        bodyType,
        timeout,
        signalId,
      };

      try {
        const response = await httpService.send(payload);
        setTabResponse(tabId, response);
        setTabDuration(tabId, response.duration);

        await historyService.add({
          method: request.method,
          url,
          status: response.status,
          statusText: response.statusText,
          duration: response.duration,
          timestamp: new Date().toISOString(),
          requestSnapshot: structuredClone(request),
        });

        if (autoSave && request.collectionId) {
          await requestService.save(request);
        }
      } finally {
        setTabLoading(tabId, false);
        signalRef.current = null;
      }
    },
    [getVariablesMap, timeout, autoSave, setTabLoading, setTabResponse, setTabDuration]
  );

  const cancel = useCallback(() => {
    if (signalRef.current) {
      httpService.cancel(signalRef.current);
      signalRef.current = null;
    }
    const active = getActiveTab();
    if (active) {
      setTabLoading(active.id, false);
    }
  }, [getActiveTab, setTabLoading]);

  return { send, cancel };
}
