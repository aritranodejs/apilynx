import type { Metadata } from 'next';
import { DM_Sans, Geist_Mono, Syne } from 'next/font/google';
import { Providers } from '@/components/providers';
import { APP_NAME, SITE_URL } from '@/content/downloads';
import './globals.css';

const display = Syne({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const sans = DM_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: APP_NAME,
  description: 'Modern API testing desktop application by Aritra Dutta',
  icons: { icon: process.env.ELECTRON_BUILD === '1' ? './icon.png' : '/icon.png' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body
        className="h-full overflow-y-auto overflow-x-hidden font-sans af-surface"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
