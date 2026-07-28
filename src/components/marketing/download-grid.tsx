import Link from 'next/link';
import {
  APP_VERSION,
  DOWNLOAD_PLATFORMS,
  HAS_ANY_LIVE_DOWNLOAD,
} from '@/content/downloads';

type Props = {
  compact?: boolean;
};

export function DownloadGrid({ compact = false }: Props) {
  return (
    <div className={compact ? 'space-y-6' : 'space-y-8'}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-zinc-400">
          Version <span className="text-zinc-200">v{APP_VERSION}</span>
          {HAS_ANY_LIVE_DOWNLOAD
            ? ' · Free desktop app'
            : ' · Desktop installers coming soon'}
        </p>
      </div>

      {!HAS_ANY_LIVE_DOWNLOAD && (
        <div className="border border-orange-500/25 bg-orange-500/10 px-4 py-4 sm:px-5">
          <p className="text-sm font-medium text-orange-100">
            Desktop packages are not published yet
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
            Windows, macOS, and Linux downloads will appear here when configured in your
            environment. Meanwhile you can use Apilynx in your browser.
          </p>
          <Link
            href="/app/"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Open Apilynx in browser
          </Link>
        </div>
      )}

      <ul className={compact ? 'grid gap-5' : 'grid gap-5 md:grid-cols-3'}>
        {DOWNLOAD_PLATFORMS.map((platform) => (
          <li
            key={platform.id}
            className="lynx-download-card flex flex-col border border-white/10 bg-black/30 p-5 sm:p-6"
          >
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
              {platform.name}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{platform.blurb}</p>

            <div className="mt-5 flex flex-col gap-2">
              {platform.builds.map((buildItem) =>
                buildItem.available ? (
                  <a
                    key={buildItem.id}
                    href={buildItem.href}
                    className="inline-flex flex-col items-center justify-center rounded-md bg-orange-500 px-3 py-2.5 text-center transition hover:bg-orange-400"
                  >
                    <span className="text-sm font-semibold text-white">{buildItem.label}</span>
                    {buildItem.note ? (
                      <span className="mt-0.5 text-[11px] font-normal text-orange-100/80">
                        {buildItem.note}
                      </span>
                    ) : null}
                  </a>
                ) : (
                  <div
                    key={buildItem.id}
                    className="inline-flex flex-col items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 py-2.5 text-center"
                    aria-disabled
                  >
                    <span className="text-sm font-semibold text-zinc-400">{buildItem.label}</span>
                    <span className="mt-0.5 text-[11px] text-zinc-500">Coming soon</span>
                  </div>
                )
              )}
            </div>

            <ol className="mt-5 list-decimal space-y-2 border-t border-white/5 pt-4 pl-4 text-xs leading-relaxed text-zinc-500">
              {platform.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </div>
  );
}
