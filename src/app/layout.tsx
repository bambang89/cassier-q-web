import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { Providers } from '@/app/providers';
import '@/app/globals.css';

// Satu keluarga font untuk seluruh app, sama seperti aplikasi mobile.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: { default: 'cassier-Q', template: '%s · cassier-Q' },
  description: 'Aplikasi kasir cassier-Q versi web',
};

export const viewport: Viewport = {
  themeColor: '#0B1F33',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
