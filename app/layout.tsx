import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { headerHtml, mobileNavHtml, footerHtml, ctaHtml } from '@/components/chrome';
import { ldJson } from '@/components/ldjson';
import NavEnhancer from '@/components/NavEnhancer';

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230A1F33'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-size='17' font-weight='700' fill='%23C9A227' text-anchor='middle'%3EV%3C/text%3E%3C/svg%3E";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vysmirasolutions.com'),
  title: {
    default: 'VYSMIRA Solutions | Specialist Talent Partner for Deep-Tech Teams, Bengaluru',
    template: '%s',
  },
  description:
    'Specialist recruitment and human capital consulting for semiconductor, embedded, automotive and engineering organisations in India.',
  icons: { icon: FAVICON },
};

export const viewport: Viewport = {
  themeColor: '#0A1F33',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className="js">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson }} />
      </head>
      <body data-page="home">
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
        <div dangerouslySetInnerHTML={{ __html: mobileNavHtml }} />
        <main id="main">{children}</main>
        <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
        <div dangerouslySetInnerHTML={{ __html: ctaHtml }} />
        <NavEnhancer />
        <Script src="/site.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
