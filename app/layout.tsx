import type { Metadata } from 'next';
import { Merriweather, Nunito_Sans } from 'next/font/google';
import Script from 'next/script';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { adsConfig, siteConfig } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';

import './globals.css';

const display = Merriweather({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700'],
});

const body = Nunito_Sans({
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
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_8%,rgba(46,111,103,0.16),transparent_34%),radial-gradient(circle_at_86%_2%,rgba(198,152,90,0.15),transparent_30%),linear-gradient(180deg,#fbfaf6_0%,#f5f3ec_56%,#efede4_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-[linear-gradient(90deg,rgba(46,111,103,0.24),rgba(46,111,103,0.04),rgba(198,152,90,0.22))] blur-2xl" />
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
