'use client';

import { useCallback, useRef } from 'react';
import { useTabsStore } from '@/stores/tabs-store';
import { useEnvironmentStore } from '@/stores/environment-store';
import { useSettingsStore } from '@/stores/settings-store';
import { httpService, historyService, requestService, collectionService, isElectronApp } from '@/services/ipc';
import { showError } from '@/stores/toast-store';
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
  methodRequiresBody,
  validateRequestUrl,
} from '@/lib/utils';
import { buildRequestBodyPayload } from '@/lib/request-body';
import { buildFormDataFromEntries } from '@/lib/form-body';
import type { KeyValuePair, SendRequestPayload } from '@/types';

function substituteInPairs(pairs: KeyValuePair[], vars: Record<string, string>): KeyValuePair[] {
  return pairs.map((p) => ({
    ...p,
    key: substituteVariables(p.key, vars),
    value: substituteVariables(p.value, vars),
  }));
}

export function useSendRequest() {
  const signalRef = useRef<string | null>(null);
  const { setTabLoading, setTabResponse, setTabDuration, getActiveTab } = useTabsStore();
  const getVariablesMap = useEnvironmentStore((s) => s.getVariablesMap);
  const getActiveEnvironment = useEnvironmentStore((s) => s.getActiveEnvironment);
  const timeout = useSettingsStore((s) => s.timeout);
  const autoSave = useSettingsStore((s) => s.autoSave);

  const send = useCallback(
    async (tabId: string) => {
      const tab = useTabsStore.getState().tabs.find((t) => t.id === tabId);
      if (!tab) return;

      const vars = getVariablesMap();
      const request = tab.request;
      const environmentAuth = getActiveEnvironment()?.defaultAuth;
      const collection = request.collectionId
        ? await collectionService.get(request.collectionId)
        : null;
      const collectionAuth = collection?.auth;
      const auth = prepareAuthForRequest(request.auth, vars, { collectionAuth, environmentAuth });

      let url = normalizeRequestUrl(substituteVariables(request.url, vars));
      url = buildUrlWithParams(url, substituteInPairs(request.params, vars));
      const urlCheck = validateRequestUrl(url);
      if (!urlCheck.valid) {
        showError(urlCheck.error ?? 'Enter a request URL before sending');
        return;
      }
      url = applyAuthToUrl(url, auth);

      const headers = applyAuthToHeaders(
        auth,
        headersFromKeyValues(substituteInPairs(request.headers, vars))
      );

      if (methodAllowsBody(request.method)) {
        if (
          (request.body.type === 'json' ||
            request.body.type === 'graphql' ||
            request.method === 'QUERY') &&
          !headers['Content-Type']
        ) {
          headers['Content-Type'] = 'application/json';
        }
        if (request.body.type === 'x-www-form-urlencoded' && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      if (methodRequiresBody(request.method)) {
        const hasTextBody = Boolean(request.body.content?.trim());
        const hasFormBody = request.body.formData.some(
          (p) => p.enabled && p.key.trim() && (p.value.trim() || p.fileData)
        );
        if (!hasTextBody && !hasFormBody) {
          showError('QUERY requests require a request body (RFC 10008)');
          return;
        }
      }

      const bodyContent = substituteVariables(request.body.content, vars);
      const formPairs = substituteInPairs(request.body.formData, vars);
      const built = methodAllowsBody(request.method)
        ? buildRequestBodyPayload(request.body.type, bodyContent, formPairs)
        : { bodyType: request.body.type };
      const { body, bodyType, formEntries } = built;

      const payloadHeaders = { ...headers };
      if (bodyType === 'form-data') {
        delete payloadHeaders['Content-Type'];
      }

      let requestBody: SendRequestPayload['body'] = body;
      if (!isElectronApp() && bodyType === 'form-data' && formEntries?.length) {
        requestBody = buildFormDataFromEntries(formEntries);
      }

      const signalId = generateId();
      signalRef.current = signalId;

      setTabLoading(tabId, true);
      setTabResponse(tabId, undefined);

      const payload: SendRequestPayload = {
        method: request.method,
        url,
        headers: payloadHeaders,
        body: requestBody,
        formEntries,
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
    [getVariablesMap, getActiveEnvironment, timeout, autoSave, setTabLoading, setTabResponse, setTabDuration]
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
