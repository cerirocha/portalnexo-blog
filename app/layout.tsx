import type { Metadata } from 'next';
import { Bodoni_Moda, Work_Sans } from 'next/font/google';
import Script from 'next/script';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { adsConfig, siteConfig } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';

import './globals.css';

const display = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700'],
});

const body = Work_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = buildMetadata();

export const revalidate = siteConfig.revalidateSeconds;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} bg-canvas text-ink antialiased`}>
        {adsConfig.client ? (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.client}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <div className="relative min-h-screen overflow-x-clip">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(15,76,129,0.11),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(158,123,69,0.12),transparent_30%),linear-gradient(180deg,#f8f7f3_0%,#f2f1eb_100%)]" />
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
