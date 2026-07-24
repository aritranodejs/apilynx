import type { NextConfig } from 'next';

/**
 * Keep distDir as `.next` (dev + build cache).
 * `output: 'export'` writes the static site to `/out`.
 * Packaged Electron serves `/out` over localhost (not file://) so App Router works.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ['@monaco-editor/react', 'monaco-editor'],
};

export default nextConfig;
