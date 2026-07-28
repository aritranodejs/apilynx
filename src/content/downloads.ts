import { joinUrl, normalizeSiteUrl } from '@/lib/env';

/**
 * Read NEXT_PUBLIC_* with static process.env.NAME access.
 * Dynamic process.env[key] is NOT inlined into client bundles by Next.js,
 * which made the homepage download section always show "Coming soon"
 * while the server-rendered docs page looked correct.
 */
function publicEnv(value: string | undefined, fallback = ''): string {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function publicEnvBool(value: string | undefined, fallback = false): boolean {
  const normalized = publicEnv(value).toLowerCase();
  if (!normalized) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

export const APP_NAME = publicEnv(process.env.NEXT_PUBLIC_APP_NAME, 'Apilynx');
export const APP_VERSION = publicEnv(process.env.NEXT_PUBLIC_APP_VERSION, '1.0.1');
export const SITE_URL = normalizeSiteUrl(
  publicEnv(process.env.NEXT_PUBLIC_SITE_URL),
  'http://localhost:3000'
);
export const GITHUB_REPO = publicEnv(
  process.env.NEXT_PUBLIC_GITHUB_REPO,
  'aritranodejs/apilynx'
);

export const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases`;
export const GITHUB_LATEST_RELEASE_URL = `${GITHUB_RELEASES_URL}/latest`;

/** Master switch from .env — false hides live download links. */
export const DOWNLOADS_LIVE = publicEnvBool(process.env.NEXT_PUBLIC_DOWNLOADS_LIVE, false);

const DOWNLOAD_BASE_URL = publicEnv(process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL, '/downloads');

/**
 * Prefer explicit URL from env; otherwise BASE + filename.
 * Returns empty string when nothing usable is configured.
 */
function resolveDownloadUrl(explicit: string, file: string): string {
  if (explicit) return explicit;
  if (!DOWNLOAD_BASE_URL) return '';
  return joinUrl(DOWNLOAD_BASE_URL, file);
}

export type DownloadBuild = {
  id: string;
  label: string;
  filename: string;
  href: string;
  note?: string;
  /** True when master switch is on and a URL is configured. */
  available: boolean;
};

export type DownloadPlatform = {
  id: 'windows' | 'macos' | 'linux';
  name: string;
  blurb: string;
  builds: DownloadBuild[];
  steps: string[];
};

function build(
  id: string,
  label: string,
  file: string,
  explicitUrl: string,
  note?: string
): DownloadBuild {
  const href = resolveDownloadUrl(explicitUrl, file);
  return {
    id,
    label,
    filename: file,
    href,
    note,
    available: DOWNLOADS_LIVE && Boolean(href),
  };
}

const winFile = publicEnv(
  process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS_FILENAME,
  `Apilynx-Setup-${APP_VERSION}.exe`
);
const macArmFile = publicEnv(
  process.env.NEXT_PUBLIC_DOWNLOAD_MAC_ARM_FILENAME,
  `Apilynx-${APP_VERSION}-arm64.dmg`
);
const macIntelFile = publicEnv(
  process.env.NEXT_PUBLIC_DOWNLOAD_MAC_INTEL_FILENAME,
  `Apilynx-${APP_VERSION}-x64.dmg`
);
const linuxDebFile = publicEnv(
  process.env.NEXT_PUBLIC_DOWNLOAD_LINUX_DEB_FILENAME,
  `apilynx_${APP_VERSION}_amd64.deb`
);
const linuxAppImageFile = publicEnv(
  process.env.NEXT_PUBLIC_DOWNLOAD_LINUX_APPIMAGE_FILENAME,
  `Apilynx-${APP_VERSION}.AppImage`
);

export const DOWNLOAD_PLATFORMS: DownloadPlatform[] = [
  {
    id: 'windows',
    name: 'Windows',
    blurb: 'Works on Windows 10 and 11 (64-bit).',
    builds: [
      build(
        'windows-exe',
        'Download for Windows',
        winFile,
        publicEnv(process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS_URL),
        'Installer · 64-bit'
      ),
    ],
    steps: [
      'Download the Windows installer.',
      'Open the file and follow the setup screens.',
      'Launch Apilynx from the Start menu or desktop shortcut.',
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    blurb: 'Separate builds for Apple Silicon and Intel Macs.',
    builds: [
      build(
        'mac-arm',
        'Download for Apple Silicon',
        macArmFile,
        publicEnv(process.env.NEXT_PUBLIC_DOWNLOAD_MAC_ARM_URL),
        'M1, M2, M3, M4'
      ),
      build(
        'mac-intel',
        'Download for Intel',
        macIntelFile,
        publicEnv(process.env.NEXT_PUBLIC_DOWNLOAD_MAC_INTEL_URL),
        'Intel Mac'
      ),
    ],
    steps: [
      'Download the disk image for your Mac (Apple Silicon or Intel).',
      'Open it and drag Apilynx into the Applications folder.',
      'Open Apilynx from Launchpad or Applications.',
      'If macOS blocks the app the first time: right-click Apilynx → Open → Open.',
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    blurb: 'Installer for Ubuntu/Debian, or a portable AppImage for most desktops.',
    builds: [
      build(
        'linux-deb',
        'Download .deb (Ubuntu / Debian)',
        linuxDebFile,
        publicEnv(process.env.NEXT_PUBLIC_DOWNLOAD_LINUX_DEB_URL),
        'Software Center friendly'
      ),
      build(
        'linux-appimage',
        'Download AppImage (portable)',
        linuxAppImageFile,
        publicEnv(process.env.NEXT_PUBLIC_DOWNLOAD_LINUX_APPIMAGE_URL),
        'No install needed'
      ),
    ],
    steps: [
      'Prefer Ubuntu, Debian, or Mint? Download the .deb and open it with Software Install / App Center.',
      'Prefer portable? Download the AppImage, allow it to run as a program in file properties, then double-click.',
      'Find Apilynx in your app menu, or open the AppImage whenever you need it.',
    ],
  },
];

/** True if at least one installer button should be active. */
export const HAS_ANY_LIVE_DOWNLOAD = DOWNLOAD_PLATFORMS.some((p) =>
  p.builds.some((b) => b.available)
);
