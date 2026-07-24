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
    <div className="overflow-x-auto rounded-md border border-white/10">
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
                  'px-3 py-3 font-semibold whitespace-nowrap',
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
              <td className="sticky left-0 z-10 bg-[#0a0b0f] px-3 py-3 text-zinc-300 min-w-[14rem]">
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
  );
}
