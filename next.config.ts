import type { NextConfig } from 'next';

/** Relative asset paths are required for Electron file:// loading in packaged apps. */
const isElectronBuild = process.env.ELECTRON_BUILD === '1';

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ['@monaco-editor/react', 'monaco-editor'],
  ...(isElectronBuild ? { assetPrefix: './' } : {}),
};

export default nextConfig;
