import {
  COMPARISON_ROWS,
  COMPARISON_TOOLS,
  type ComparisonValue,
} from '@/content/comparison';
import { cn } from '@/lib/utils';

function Cell({ value }: { value: ComparisonValue }) {
  if (value === 'yes') {
    return (
      <span className="inline-flex rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
        Yes
      </span>
    );
  }
  if (value === 'no') {
    return (
      <span className="inline-flex rounded bg-zinc-500/20 px-2 py-0.5 text-xs font-semibold text-zinc-400">
        No
      </span>
    );
  }
  if (value === 'partial') {
    return (
      <span className="inline-flex rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
        Partial
      </span>
    );
  }
  return <span className="text-sm text-zinc-300">{value}</span>;
}

export function ComparisonTable() {
  return (
    <>
      <div className="space-y-4 md:hidden">
        {COMPARISON_ROWS.map((row) => (
          <div
            key={row.feature}
            className="rounded-md border border-white/10 bg-white/[0.02] p-4"
          >
            <h3 className="text-sm font-semibold text-zinc-100">{row.feature}</h3>
            {row.note ? <p className="mt-1 text-xs text-zinc-600">{row.note}</p> : null}
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
              {COMPARISON_TOOLS.map((tool) => (
                <div key={tool.id} className="flex items-center justify-between gap-2">
                  <dt
                    className={cn(
                      'truncate text-xs text-zinc-500',
                      tool.id === 'apilynx' && 'font-medium text-orange-300'
                    )}
                  >
                    {tool.name}
                  </dt>
                  <dd className="shrink-0">
                    <Cell value={row[tool.id]} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-white/10 md:block">
        <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="sticky left-0 z-10 bg-[#12131a] px-3 py-3 font-semibold text-zinc-200">
                Feature
              </th>
              {COMPARISON_TOOLS.map((tool) => (
                <th
                  key={tool.id}
                  className={cn(
                    'whitespace-nowrap px-3 py-3 font-semibold',
                    tool.id === 'apilynx' ? 'text-orange-300' : 'text-zinc-200'
                  )}
                >
                  {tool.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.feature} className="border-t border-white/5">
                <td className="sticky left-0 z-10 min-w-[14rem] bg-[#0a0b0f] px-3 py-3 text-zinc-300">
                  <span>{row.feature}</span>
                  {row.note ? (
                    <span className="mt-1 block text-xs text-zinc-600">{row.note}</span>
                  ) : null}
                </td>
                {COMPARISON_TOOLS.map((tool) => (
                  <td key={tool.id} className="px-3 py-3">
                    <Cell value={row[tool.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
