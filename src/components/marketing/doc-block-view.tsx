import type { DocBlock } from '@/content/docs';

export function DocBlockView({ block }: { block: DocBlock }) {
  const hasHeading = Boolean(block.heading);
  return (
    <section>
      {block.heading && (
        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">{block.heading}</h2>
      )}
      {block.paragraphs.map((p, j) => (
        <p
          key={j}
          className={`max-w-3xl text-[15px] leading-relaxed text-zinc-400 ${
            hasHeading || j > 0 ? 'mt-3' : ''
          }`}
        >
          {p}
        </p>
      ))}
      {block.list && block.list.length > 0 && (
        <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-zinc-400">
          {block.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {block.table && (
        <div className="mt-4 w-full max-w-full overflow-x-auto rounded-md border border-white/10 lynx-code-block">
          <table className="w-full min-w-[20rem] border-collapse text-left text-sm sm:min-w-[28rem]">
            <thead className="bg-white/5 text-zinc-200">
              <tr>
                {block.table.headers.map((h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-white/5 text-zinc-400">
                  {row.map((cell, ci) => (
                    <td key={`${ri}-${ci}`} className="px-3 py-2.5 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {block.code && (
        <pre className="lynx-code-block mt-4 max-w-3xl overflow-x-auto rounded-md border border-white/10 bg-black/50 p-4 font-mono text-[13px] leading-relaxed text-zinc-300">
          <code>{block.code}</code>
        </pre>
      )}
      {block.callout && (
        <p className="mt-4 max-w-3xl border-l-2 border-orange-500/50 bg-orange-500/5 px-4 py-3 text-sm leading-relaxed text-zinc-300">
          {block.callout}
        </p>
      )}
    </section>
  );
}
