'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type Phase = 'typing' | 'sending' | 'response';

type Scenario = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  url: string;
  status: number;
  statusText: string;
  duration: number;
  body: string;
};

const SCENARIOS: Scenario[] = [
  {
    method: 'GET',
    url: 'https://api.apilynx.dev/v1/users',
    status: 200,
    statusText: 'OK',
    duration: 42,
    body: '{\n  "users": [\n    { "id": 1, "name": "Aritra", "role": "admin" }\n  ]\n}',
  },
  {
    method: 'POST',
    url: 'https://api.apilynx.dev/v1/auth/login',
    status: 201,
    statusText: 'Created',
    duration: 118,
    body: '{\n  "token": "eyJhbG…",\n  "expiresIn": 3600\n}',
  },
  {
    method: 'PATCH',
    url: 'https://api.apilynx.dev/v1/orders/8821',
    status: 200,
    statusText: 'OK',
    duration: 67,
    body: '{\n  "id": 8821,\n  "status": "shipped"\n}',
  },
  {
    method: 'DELETE',
    url: 'https://api.apilynx.dev/v1/sessions',
    status: 204,
    statusText: 'No Content',
    duration: 31,
    body: '',
  },
];

type LogEntry = {
  id: number;
  method: string;
  path: string;
  status: number;
  duration: number;
};

function methodBadgeClass(method: string) {
  if (method === 'GET') return 'bg-emerald-500/15 text-emerald-400';
  if (method === 'POST') return 'bg-orange-500/15 text-orange-400';
  if (method === 'PATCH') return 'bg-sky-500/15 text-sky-400';
  return 'bg-rose-500/15 text-rose-400';
}

function methodTextClass(method: string) {
  if (method === 'GET') return 'text-emerald-400';
  if (method === 'POST') return 'text-orange-400';
  if (method === 'PATCH') return 'text-sky-400';
  return 'text-rose-400';
}

function statusClass(status: number) {
  if (status >= 200 && status < 300) return 'text-emerald-400';
  if (status >= 400) return 'text-rose-400';
  return 'text-zinc-300';
}

function highlightJsonLine(line: string) {
  return line
    .replace(/("[^"]+")(\s*:)/g, '<span class="text-sky-300/90">$1</span>$2')
    .replace(/:\s*(".*?")/g, ': <span class="text-emerald-300/90">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="text-orange-300/90">$1</span>');
}

export function HeroApiDemo({ className }: { className?: string }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [typedLength, setTypedLength] = useState(0);
  const [visibleBodyLines, setVisibleBodyLines] = useState(0);
  const [sendProgress, setSendProgress] = useState(0);
  const [displayDuration, setDisplayDuration] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const logIdRef = useRef(0);
  const loggedScenarioRef = useRef(-1);

  const scenario = SCENARIOS[scenarioIndex]!;
  const typedUrl = scenario.url.slice(0, typedLength);
  const bodyLines = scenario.body ? scenario.body.split('\n') : [];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setPhase('response');
      setTypedLength(scenario.url.length);
      setVisibleBodyLines(bodyLines.length);
      setSendProgress(100);
      setDisplayDuration(scenario.duration);
      return;
    }

    setPhase('typing');
    setTypedLength(0);
    setVisibleBodyLines(0);
    setSendProgress(0);
    setDisplayDuration(0);
    loggedScenarioRef.current = -1;
  }, [scenarioIndex, reducedMotion, scenario.url.length, bodyLines.length, scenario.duration]);

  useEffect(() => {
    if (reducedMotion) return;

    if (phase === 'typing') {
      if (typedLength >= scenario.url.length) {
        const timer = window.setTimeout(() => setPhase('sending'), 400);
        return () => window.clearTimeout(timer);
      }
      const timer = window.setInterval(() => setTypedLength((n) => n + 1), 22);
      return () => window.clearInterval(timer);
    }

    if (phase === 'sending') {
      setSendProgress(0);
      const progressTimer = window.setInterval(() => {
        setSendProgress((p) => Math.min(p + 4, 100));
      }, 34);
      const phaseTimer = window.setTimeout(() => setPhase('response'), 900);
      return () => {
        window.clearInterval(progressTimer);
        window.clearTimeout(phaseTimer);
      };
    }

    if (phase === 'response') {
      if (visibleBodyLines < bodyLines.length) {
        const timer = window.setInterval(() => setVisibleBodyLines((n) => n + 1), 85);
        return () => window.clearInterval(timer);
      }

      if (displayDuration < scenario.duration) {
        const step = Math.max(1, Math.ceil(scenario.duration / 12));
        const timer = window.setInterval(() => {
          setDisplayDuration((d) => {
            const next = d + step;
            return next >= scenario.duration ? scenario.duration : next;
          });
        }, 40);
        return () => window.clearInterval(timer);
      }

      if (loggedScenarioRef.current !== scenarioIndex) {
        loggedScenarioRef.current = scenarioIndex;
        const path = (() => {
          try {
            return new URL(scenario.url).pathname;
          } catch {
            return scenario.url;
          }
        })();
        logIdRef.current += 1;
        const entry: LogEntry = {
          id: logIdRef.current,
          method: scenario.method,
          path,
          status: scenario.status,
          duration: scenario.duration,
        };
        setLog((prev) => [entry, ...prev].slice(0, 4));
      }

      const timer = window.setTimeout(() => {
        setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
      }, 2600);
      return () => window.clearTimeout(timer);
    }
  }, [
    phase,
    typedLength,
    visibleBodyLines,
    bodyLines.length,
    scenario,
    scenarioIndex,
    reducedMotion,
    displayDuration,
  ]);

  return (
    <div className={cn('lynx-hero-demo-wrap relative', className)}>
      <div
        className="lynx-hero-demo-glow pointer-events-none absolute -inset-px rounded-xl opacity-60"
        aria-hidden
      />
      <div className="lynx-hero-demo relative overflow-hidden rounded-xl border border-white/10 bg-[#0c0d12]/95 shadow-2xl shadow-orange-500/10 backdrop-blur-sm">
        <div className="lynx-scan-line pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" aria-hidden />

        <div className="flex items-center gap-2 border-b border-white/10 bg-zinc-900/60 px-3 py-2.5 sm:px-4">
          <div className="flex shrink-0 gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="min-w-0 truncate text-[10px] font-medium text-zinc-500 sm:text-[11px]">
            Apilynx — live preview
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5">
            <span className="lynx-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] uppercase tracking-wider text-emerald-400/90">Live</span>
          </span>
        </div>

        <div className="hidden gap-1 border-b border-white/5 bg-black/20 px-3 py-1.5 sm:flex sm:px-4">
          {['Params', 'Headers', 'Body', 'Tests'].map((tab, i) => (
            <span
              key={tab}
              className={cn(
                'rounded px-2 py-0.5 text-[10px] transition-colors duration-300',
                phase === 'response' && i === 0
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-zinc-600'
              )}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="space-y-2 border-b border-white/10 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'lynx-method-badge shrink-0 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide transition-all duration-500 sm:text-[11px]',
                methodBadgeClass(scenario.method)
              )}
            >
              {scenario.method}
            </span>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition-all sm:gap-1.5 sm:px-3 sm:text-xs',
                phase === 'sending'
                  ? 'bg-orange-500/80 text-white lynx-send-pulse'
                  : 'bg-orange-500 text-white hover:bg-orange-400'
              )}
            >
              {phase === 'sending' ? (
                <Loader2 className="h-3 w-3 animate-spin sm:h-3.5 sm:w-3.5" />
              ) : (
                <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              )}
              <span className="sm:inline">Send</span>
            </button>
          </div>

          <div
            className={cn(
              'min-w-0 overflow-hidden rounded-md border border-white/5 bg-black/40 px-2.5 py-2',
              phase === 'typing' && 'lynx-url-shimmer'
            )}
          >
            <p className="truncate font-mono text-[10px] text-zinc-300 sm:text-xs">
              {typedUrl || '\u00A0'}
              {phase === 'typing' && (
                <span className="lynx-type-cursor ml-px inline-block h-3 w-0.5 translate-y-0.5 bg-orange-400" />
              )}
            </p>
          </div>

          {phase === 'sending' && (
            <div className="space-y-1.5">
              <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="lynx-progress-bar h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-[width] duration-75 ease-out"
                  style={{ width: `${sendProgress}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 sm:text-xs">
                <span className="lynx-dots flex gap-1">
                  <span className="h-1 w-1 rounded-full bg-orange-400" />
                  <span className="h-1 w-1 rounded-full bg-orange-400" />
                  <span className="h-1 w-1 rounded-full bg-orange-400" />
                </span>
                Sending request…
              </div>
            </div>
          )}
        </div>

        <div className="min-h-[7.5rem] p-3 sm:min-h-[9rem] sm:p-4">
          {phase === 'typing' && (
            <p className="lynx-fade-up text-[11px] text-zinc-600 sm:text-xs">
              Type a URL and hit Send to test your API…
            </p>
          )}
          {phase === 'response' && (
            <div className="lynx-response-in space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'lynx-status-pop rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold sm:text-xs',
                    statusClass(scenario.status)
                  )}
                >
                  {scenario.status} {scenario.statusText}
                </span>
                <span className="font-mono text-[10px] text-zinc-500 sm:text-xs">
                  {displayDuration} ms
                </span>
              </div>
              {bodyLines.length > 0 ? (
                <pre className="max-h-28 overflow-x-auto overflow-y-auto rounded-md border border-white/5 bg-black/30 p-2 font-mono text-[9px] leading-relaxed sm:max-h-32 sm:p-2.5 sm:text-[10px]">
                  {bodyLines.slice(0, visibleBodyLines).map((line, i) => (
                    <div
                      key={`${scenarioIndex}-${i}`}
                      className="lynx-json-line"
                      style={{ animationDelay: `${i * 60}ms` }}
                      dangerouslySetInnerHTML={{ __html: highlightJsonLine(line) }}
                    />
                  ))}
                </pre>
              ) : (
                <p className="text-[11px] italic text-zinc-600 sm:text-xs">No response body</p>
              )}
            </div>
          )}
        </div>

        {log.length > 0 && (
          <div className="border-t border-white/10 bg-black/30 px-3 py-3 sm:px-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              Recent requests
            </p>
            <div className="space-y-1">
              {log.map((entry, i) => (
                <div
                  key={entry.id}
                  className={cn(
                    'lynx-log-row flex min-w-0 items-center gap-1.5 rounded px-1 py-0.5 font-mono text-[9px] sm:gap-2 sm:text-[10px]',
                    i === 0 && 'lynx-log-flash bg-orange-500/10'
                  )}
                >
                  <span className={cn('w-9 shrink-0 font-semibold sm:w-10', methodTextClass(entry.method))}>
                    {entry.method}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-zinc-400">{entry.path}</span>
                  <span className={cn('w-7 shrink-0 text-right sm:w-8', statusClass(entry.status))}>
                    {entry.status}
                  </span>
                  <span className="w-10 shrink-0 text-right text-zinc-600 sm:w-11">{entry.duration}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
