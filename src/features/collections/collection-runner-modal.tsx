'use client';

import { useState } from 'react';
import type { ApiRequest, Collection, RunnerResult } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { runCollectionRequests } from '@/lib/collection-runner';
import { useEnvironmentStore } from '@/stores/environment-store';
import { useSettingsStore } from '@/stores/settings-store';
import { CheckCircle2, Loader2, Play, XCircle } from 'lucide-react';

interface CollectionRunnerModalProps {
  open: boolean;
  onClose: () => void;
  collection: Collection | null;
  requests: ApiRequest[];
}

export function CollectionRunnerModal({
  open,
  onClose,
  collection,
  requests,
}: CollectionRunnerModalProps) {
  const [running, setRunning] = useState(false);
  const [delayMs, setDelayMs] = useState(0);
  const [results, setResults] = useState<RunnerResult[]>([]);
  const getVariablesMap = useEnvironmentStore((s) => s.getVariablesMap);
  const getActiveEnvironment = useEnvironmentStore((s) => s.getActiveEnvironment);
  const timeout = useSettingsStore((s) => s.timeout);

  const handleRun = async () => {
    if (!collection || requests.length === 0) return;
    setRunning(true);
    setResults([]);
    try {
      const vars = getVariablesMap();
      const out = await runCollectionRequests(requests, vars, timeout, delayMs, {
        collectionAuth: collection.auth,
        environmentAuth: getActiveEnvironment()?.defaultAuth,
      });
      setResults(out);
    } finally {
      setRunning(false);
    }
  };

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  return (
    <Modal open={open} onClose={onClose} title={`Collection Runner — ${collection?.name ?? ''}`}>
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Runs all {requests.length} requests in order with environment variables and tests.
        </p>
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-500">Delay between requests (ms)</label>
          <Input
            type="number"
            value={delayMs}
            onChange={(e) => setDelayMs(parseInt(e.target.value, 10) || 0)}
            className="w-24 text-xs"
            min={0}
          />
          <Button variant="primary" onClick={() => void handleRun()} disabled={running || requests.length === 0}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run collection
          </Button>
        </div>

        {results.length > 0 && (
          <div className="text-sm">
            <span className="text-emerald-400">{passed} passed</span>
            <span className="text-zinc-500 mx-2">·</span>
            <span className="text-red-400">{failed} failed</span>
          </div>
        )}

        <div className="max-h-80 overflow-auto space-y-2">
          {results.map((r) => (
            <div
              key={r.requestId}
              className={`p-3 rounded-lg border text-xs ${
                r.passed ? 'border-emerald-900/50 bg-emerald-950/20' : 'border-red-900/50 bg-red-950/20'
              }`}
            >
              <div className="flex items-center gap-2">
                {r.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span className="font-mono text-orange-400">{r.method}</span>
                <span className="text-zinc-200 truncate">{r.requestName}</span>
                <span className="ml-auto text-zinc-500">{r.status || '—'} · {r.duration}ms</span>
              </div>
              <p className="text-zinc-500 truncate mt-1 font-mono">{r.url}</p>
              {r.error && <p className="text-red-400 mt-1">{r.error}</p>}
              {r.testResults.map((t, i) => (
                <p key={i} className={t.passed ? 'text-emerald-400/80' : 'text-red-400/80'}>
                  {t.passed ? '✓' : '✗'} {t.message}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
