'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiRequest, HttpMethod } from '@/types';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { KeyValueEditor } from '@/components/ui/key-value-editor';
import { BodyEditor } from '@/features/requests/body-editor';
import { AuthEditor } from '@/features/auth/auth-editor';
import { ImportCurlModal } from '@/features/requests/import-curl-modal';
import { TestsPanel } from '@/features/requests/tests-panel';
import { CodeGenPanel } from '@/features/requests/code-gen-panel';
import { LoadTestPanel } from '@/features/requests/load-test-panel';
import { RequestToolbar } from '@/features/requests/request-toolbar';
import { buildUrlWithParams, methodColor, substituteVariables } from '@/lib/utils';
import { useEnvironmentStore } from '@/stores/environment-store';
import { useSendRequest } from '@/hooks/use-send-request';
import { requestService, collectionService } from '@/services/ipc';
import { showError, showSuccess } from '@/stores/toast-store';
import { Loader2, Send, Square, Terminal } from 'lucide-react';
import { useTabsStore } from '@/stores/tabs-store';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const HEADER_SUGGESTIONS = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Accept', value: 'application/json' },
  { key: 'Authorization', value: 'Bearer ' },
  { key: 'User-Agent', value: 'Apilynx/1.0' },
  { key: 'Cache-Control', value: 'no-cache' },
];

type RequestTab = 'params' | 'headers' | 'body' | 'auth' | 'docs' | 'tests' | 'code' | 'load';

interface RequestBuilderProps {
  tabId: string;
  request: ApiRequest;
  onSave?: () => void;
}

export function RequestBuilder({ tabId, request, onSave }: RequestBuilderProps) {
  const [activeSection, setActiveSection] = useState<RequestTab>('params');
  const [showImportCurl, setShowImportCurl] = useState(false);
  const updateTabRequest = useTabsStore((s) => s.updateTabRequest);
  const duplicateTab = useTabsStore((s) => s.duplicateTab);
  const isLoading = useTabsStore((s) => s.tabs.find((t) => t.id === tabId)?.isLoading ?? false);
  const getVariablesMap = useEnvironmentStore((s) => s.getVariablesMap);
  const getActiveEnvironment = useEnvironmentStore((s) => s.getActiveEnvironment);
  const { send, cancel } = useSendRequest();
  const queryClient = useQueryClient();

  const { data: collection } = useQuery({
    queryKey: ['collection', request.collectionId],
    queryFn: () => collectionService.get(request.collectionId!),
    enabled: !!request.collectionId,
  });

  const vars = getVariablesMap();
  const resolvedUrl = buildUrlWithParams(
    substituteVariables(request.url, vars),
    request.params.map((p) => ({
      ...p,
      key: substituteVariables(p.key, vars),
      value: substituteVariables(p.value, vars),
    }))
  );

  const update = (partial: Partial<ApiRequest>) => updateTabRequest(tabId, partial);

  const handleQuickSave = async () => {
    if (request.collectionId) {
      try {
        await requestService.save(request);
        void queryClient.invalidateQueries({ queryKey: ['requests', request.collectionId] });
        showSuccess('Request saved');
      } catch (e) {
        showError(e instanceof Error ? e.message : 'Failed to save');
      }
    } else if (onSave) {
      onSave();
    }
  };

  const handleDelete = async () => {
    if (request.collectionId) {
      if (!confirm(`Delete "${request.name}" from collection?`)) return;
      try {
        await requestService.delete(request.id);
        void queryClient.invalidateQueries({ queryKey: ['requests', request.collectionId] });
        void queryClient.invalidateQueries({ queryKey: ['collections'] });
        update({ collectionId: undefined });
        showSuccess('Request deleted from collection');
      } catch (e) {
        showError(e instanceof Error ? e.message : 'Failed to delete');
      }
    } else {
      showError('Save the request to a collection first, or close this tab');
    }
  };

  const sections: { id: RequestTab; label: string }[] = [
    { id: 'params', label: 'Params' },
    { id: 'headers', label: 'Headers' },
    { id: 'body', label: 'Body' },
    { id: 'auth', label: 'Auth' },
    { id: 'docs', label: 'Docs' },
    { id: 'tests', label: 'Tests' },
    { id: 'code', label: 'Code' },
    { id: 'load', label: 'Load Test' },
  ];

  return (
    <div className="flex flex-col h-full">
      <RequestToolbar
        request={request}
        onNameChange={(name) => update({ name })}
        onSave={() => void handleQuickSave()}
        onDelete={() => void handleDelete()}
        onDuplicate={() => duplicateTab(tabId)}
        isSaved={!!request.collectionId}
      />

      <div className="flex items-center gap-2 border-b border-zinc-800 p-3">
        <Select
          value={request.method}
          onChange={(e) => update({ method: e.target.value as HttpMethod })}
          className={`w-28 font-semibold ${methodColor(request.method)}`}
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
        <Input
          value={request.url}
          onChange={(e) => update({ url: e.target.value })}
          placeholder="https://api.example.com/{{BASE_URL}}"
          className="flex-1 font-mono text-sm"
        />
        {isLoading ? (
          <Button variant="danger" onClick={cancel}>
            <Square className="h-4 w-4" /> Cancel
          </Button>
        ) : (
          <Button variant="primary" onClick={() => void send(tabId)}>
            <Send className="h-4 w-4" /> Send
          </Button>
        )}
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-orange-400" />}
        <Button variant="secondary" size="sm" onClick={() => setShowImportCurl(true)} title="Import cURL">
          <Terminal className="h-4 w-4" /> Import cURL
        </Button>
      </div>

      {resolvedUrl && (
        <div className="px-3 py-1.5 text-xs font-mono text-zinc-500 border-b border-zinc-800 truncate">
          → {resolvedUrl}
        </div>
      )}

      <div className="flex border-b border-zinc-800">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 text-sm transition-colors ${
              activeSection === s.id
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeSection === 'params' && (
          <div className="p-4">
            <KeyValueEditor
              pairs={request.params}
              onChange={(params) => update({ params })}
              keyPlaceholder="Parameter"
              valuePlaceholder="Value"
            />
          </div>
        )}
        {activeSection === 'headers' && (
          <div className="p-4">
            <KeyValueEditor
              pairs={request.headers}
              onChange={(headers) => update({ headers })}
              suggestions={HEADER_SUGGESTIONS}
            />
          </div>
        )}
        {activeSection === 'body' && (
          <BodyEditor body={request.body} onChange={(body) => update({ body })} />
        )}
        {activeSection === 'auth' && (
          <AuthEditor
            auth={request.auth}
            onChange={(auth) => update({ auth })}
            showInherit
            collectionAuth={collection?.auth}
            environmentAuth={getActiveEnvironment()?.defaultAuth}
          />
        )}
        {activeSection === 'docs' && (
          <div className="p-4 space-y-3">
            <label className="text-xs text-zinc-500 uppercase tracking-wide">Request description</label>
            <textarea
              value={request.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Document this endpoint for your team and API docs..."
              className="w-full h-32 rounded-lg bg-zinc-900 border border-zinc-700 p-3 text-sm text-zinc-200 resize-none"
            />
            <label className="text-xs text-zinc-500 uppercase tracking-wide">Example response (for docs & mock server)</label>
            <textarea
              value={request.exampleResponse ?? ''}
              onChange={(e) => update({ exampleResponse: e.target.value })}
              placeholder='{"id": 1, "name": "Example"}'
              className="w-full h-40 rounded-lg bg-zinc-900 border border-zinc-700 p-3 text-sm font-mono text-zinc-200 resize-none"
            />
          </div>
        )}
        {activeSection === 'tests' && (
          <TestsPanel tests={request.tests} onChange={(tests) => update({ tests })} />
        )}
        {activeSection === 'code' && <CodeGenPanel request={request} resolvedUrl={resolvedUrl} />}
        {activeSection === 'load' && (
          <LoadTestPanel request={request} resolvedUrl={resolvedUrl} />
        )}
      </div>

      <ImportCurlModal
        open={showImportCurl}
        onClose={() => setShowImportCurl(false)}
        onImport={(partial) => update(partial)}
      />
    </div>
  );
}
