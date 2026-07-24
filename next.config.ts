import type { NextConfig } from 'next';

/** Relative asset paths are required for Electron file:// loading in packaged apps. */
const isElectronBuild = process.env.ELECTRON_BUILD === '1';

/**
 * Keep distDir as `.next` (dev + build cache).
 * `output: 'export'` still writes the static site to `/out` for Electron.
 * Using `distDir: 'out'` breaks `next dev` after a production export.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ['@monaco-editor/react', 'monaco-editor'],
  ...(isElectronBuild ? { assetPrefix: './' } : {}),
};

export default nextConfig;
