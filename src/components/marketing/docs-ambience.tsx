'use client';

export function DocsAmbience() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="lynx-docs-orb absolute -right-32 top-0 h-80 w-80 rounded-full bg-orange-500/6 blur-3xl" />
      <div className="lynx-docs-orb-reverse absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
