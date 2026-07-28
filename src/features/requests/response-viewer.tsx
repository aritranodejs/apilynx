'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import type { ApiRequest, ApiResponse } from '@/types';
import { runRequestTests } from '@/lib/docs-generator';
import { sanitizeResponseContent, stripDangerousPatterns } from '@/lib/security';
import { formatBytes, formatDuration, getStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CodeEditor } from '@/components/ui/code-editor';
import { Copy, Download, Search } from 'lucide-react';

type ResponseTab = 'pretty' | 'raw' | 'headers' | 'tests';

interface ResponseViewerProps {
  response?: ApiResponse;
  isLoading?: boolean;
  request?: ApiRequest;
  onSaveExample?: (body: string) => void;
}

function JsonTreeView({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null) return <span className="text-zinc-500">null</span>;
  if (typeof data === 'boolean') return <span className="text-purple-400">{String(data)}</span>;
  if (typeof data === 'number') return <span className="text-blue-400">{data}</span>;
  if (typeof data === 'string')
    return <span className="text-emerald-400">&quot;{sanitizeResponseContent(data)}&quot;</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-zinc-400">[]</span>;
    return (
      <div style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
        <span className="text-zinc-400">[</span>
        {data.map((item, i) => (
          <div key={i} className="pl-4">
            <JsonTreeView data={item} depth={depth + 1} />
            {i < data.length - 1 && <span className="text-zinc-500">,</span>}
          </div>
        ))}
        <span className="text-zinc-400">]</span>
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-zinc-400">{'{}'}</span>;
    return (
      <div style={{ paddingLeft: depth > 0 ? 16 : 0 }}>
        <span className="text-zinc-400">{'{'}</span>
        {entries.map(([key, value], i) => (
          <div key={key} className="pl-4">
            <span className="text-orange-300">&quot;{key}&quot;</span>
            <span className="text-zinc-500">: </span>
            <JsonTreeView data={value} depth={depth + 1} />
            {i < entries.length - 1 && <span className="text-zinc-500">,</span>}
          </div>
        ))}
        <span className="text-zinc-400">{'}'}</span>
      </div>
    );
  }

  return <span className="text-zinc-300">{String(data)}</span>;
}

export const ResponseViewer = memo(function ResponseViewer({
  response,
  isLoading,
  request,
  onSaveExample,
}: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<ResponseTab>('pretty');
  const [search, setSearch] = useState('');

  const safeBody = useMemo(() => {
    if (!response) return '';
    return stripDangerousPatterns(sanitizeResponseContent(response.body));
  }, [response]);

  const parsedJson = useMemo(() => {
    try {
      return JSON.parse(safeBody);
    } catch {
      return null;
    }
  }, [safeBody]);

  const filteredBody = useMemo(() => {
    if (!search.trim()) return safeBody;
    const lines = safeBody.split('\n');
    return lines.filter((l) => l.toLowerCase().includes(search.toLowerCase())).join('\n');
  }, [safeBody, search]);

  const testResults = useMemo(() => {
    if (!response || !request?.tests?.length) return [];
    return runRequestTests(request.tests, response);
  }, [response, request?.tests]);

  const handleCopy = useCallback(async () => {
    if (response) await navigator.clipboard.writeText(response.body);
  }, [response]);

  const handleDownload = useCallback(() => {
    if (!response) return;
    const blob = new Blob([response.body], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [response]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        <div className="animate-pulse">Sending request...</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        Send a request to see the response
      </div>
    );
  }

  const tabs: { id: ResponseTab; label: string }[] = [
    { id: 'pretty', label: 'Pretty' },
    { id: 'raw', label: 'Raw' },
    { id: 'headers', label: 'Headers' },
    ...(request?.tests?.length ? [{ id: 'tests' as const, label: 'Test Results' }] : []),
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 px-3 py-2 text-xs sm:gap-4 sm:px-4 sm:text-sm">
        <span className={`shrink-0 font-semibold ${getStatusColor(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="shrink-0 text-zinc-500">{formatDuration(response.duration)}</span>
        <span className="shrink-0 text-zinc-500">{formatBytes(response.size)}</span>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-8 w-40 pl-8 text-xs"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={() => void handleCopy()} title="Copy response">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} title="Download response">
            <Download className="h-3.5 w-3.5" />
          </Button>
          {onSaveExample && response.body && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSaveExample(response.body)}
              title="Save as example response"
              className="hidden sm:inline-flex"
            >
              Save example
            </Button>
          )}
        </div>
      </div>

      <div className="flex shrink-0 overflow-x-auto border-b border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:text-sm ${
              activeTab === t.id
                ? 'border-b-2 border-orange-400 text-orange-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {activeTab === 'pretty' && (
          parsedJson !== null ? (
            <JsonTreeView data={parsedJson} />
          ) : (
            <pre className="whitespace-pre-wrap text-zinc-300">{filteredBody}</pre>
          )
        )}
        {activeTab === 'raw' && (
          <pre className="whitespace-pre-wrap break-all text-[var(--text-primary)] min-h-[120px] p-2 rounded border af-border af-surface-2 overflow-auto max-h-full">
            {filteredBody || '(empty response)'}
          </pre>
        )}
        {activeTab === 'headers' && (
          <div className="space-y-1">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="text-orange-300 shrink-0">{key}:</span>
                <span className="text-zinc-300 break-all">{sanitizeResponseContent(value)}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'tests' && (
          <div className="space-y-2">
            {testResults.length === 0 ? (
              <p className="text-zinc-500">No tests configured</p>
            ) : (
              testResults.map((t, i) => (
                <div
                  key={i}
                  className={`p-2 rounded ${t.passed ? 'bg-emerald-950/30 text-emerald-400' : 'bg-red-950/30 text-red-400'}`}
                >
                  {t.passed ? '✓' : '✗'} {t.message}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
});
