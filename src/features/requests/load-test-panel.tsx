'use client';

import { useState } from 'react';
import type { ApiRequest } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { httpService } from '@/services/ipc';
import { useSettingsStore } from '@/stores/settings-store';
import {
  applyAuthToHeaders,
  applyAuthToUrl,
  generateId,
  headersFromKeyValues,
  methodAllowsBody,
  normalizeRequestUrl,
} from '@/lib/utils';
import type { SendRequestPayload } from '@/types';
import { Play, Square } from 'lucide-react';

interface LoadTestPanelProps {
  request: ApiRequest;
  resolvedUrl: string;
}

interface LoadResult {
  status: number;
  duration: number;
  ok: boolean;
}

export function LoadTestPanel({ request, resolvedUrl }: LoadTestPanelProps) {
  const timeout = useSettingsStore((s) => s.timeout);
  const [iterations, setIterations] = useState(10);
  const [concurrency, setConcurrency] = useState(2);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<LoadResult[]>([]);
  const [abort, setAbort] = useState(false);

  const runLoadTest = async () => {
    setRunning(true);
    setAbort(false);
    setResults([]);
    const collected: LoadResult[] = [];

    const headers = applyAuthToHeaders(request.auth, headersFromKeyValues(request.headers));
    let url = applyAuthToUrl(resolvedUrl, request.auth);
    url = normalizeRequestUrl(url);

    const body =
      methodAllowsBody(request.method) && request.body.content
        ? request.body.content
        : undefined;

    const payload: SendRequestPayload = {
      method: request.method,
      url,
      headers,
      body,
      bodyType: request.body.type,
      timeout,
      signalId: generateId(),
    };

    let index = 0;
    const total = Math.min(Math.max(iterations, 1), 1000);
    const workers = Math.min(Math.max(concurrency, 1), 50);

    const worker = async () => {
      while (index < total && !abort) {
        const i = index++;
        const signalId = `${payload.signalId}-${i}`;
        const start = Date.now();
        try {
          const res = await httpService.send({ ...payload, signalId });
          collected.push({
            status: res.status,
            duration: res.duration,
            ok: res.status >= 200 && res.status < 400,
          });
        } catch {
          collected.push({ status: 0, duration: Date.now() - start, ok: false });
        }
        setResults([...collected]);
      }
    };

    await Promise.all(Array.from({ length: workers }, () => worker()));
    setRunning(false);
  };

  const durations = results.map((r) => r.duration);
  const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const min = durations.length ? Math.min(...durations) : 0;
  const max = durations.length ? Math.max(...durations) : 0;
  const success = results.filter((r) => r.ok).length;
  const sorted = [...durations].sort((a, b) => a - b);
  const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1] : 0;

  return (
    <div className="p-4 space-y-4">
      <p className="text-xs text-zinc-500">
        Run this request multiple times to measure performance — like Postman Collection Runner /
        load tests.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Iterations</label>
          <Input
            type="number"
            min={1}
            max={1000}
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Concurrency</label>
          <Input
            type="number"
            min={1}
            max={50}
            value={concurrency}
            onChange={(e) => setConcurrency(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="text-xs font-mono text-zinc-500 truncate">→ {resolvedUrl}</div>
      <div className="flex gap-2">
        {running ? (
          <Button variant="danger" onClick={() => setAbort(true)}>
            <Square className="h-4 w-4" /> Stop
          </Button>
        ) : (
          <Button variant="primary" onClick={() => void runLoadTest()}>
            <Play className="h-4 w-4" /> Run load test
          </Button>
        )}
      </div>

      {results.length > 0 && (
        <div className="rounded-lg border border-zinc-800 p-3 space-y-2">
          <h4 className="text-xs font-medium text-zinc-300">Results ({results.length} requests)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="rounded bg-zinc-800/50 p-2">
              <span className="text-zinc-500">Success rate</span>
              <p className="text-lg font-semibold text-emerald-400">
                {((success / results.length) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="rounded bg-zinc-800/50 p-2">
              <span className="text-zinc-500">Avg</span>
              <p className="text-lg font-semibold">{avg.toFixed(0)} ms</p>
            </div>
            <div className="rounded bg-zinc-800/50 p-2">
              <span className="text-zinc-500">Min / Max</span>
              <p className="text-lg font-semibold">
                {min.toFixed(0)} / {max.toFixed(0)} ms
              </p>
            </div>
            <div className="rounded bg-zinc-800/50 p-2">
              <span className="text-zinc-500">p95</span>
              <p className="text-lg font-semibold">{p95.toFixed(0)} ms</p>
            </div>
            <div className="rounded bg-zinc-800/50 p-2">
              <span className="text-zinc-500">Failed</span>
              <p className="text-lg font-semibold text-red-400">{results.length - success}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
