import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SagarGrid — An address for every wave',
  description:
    "Free offline peer-to-peer safety mesh for India's unserved fishing boats. Samsung Solve for Tomorrow 2026.",
};

export const viewport: Viewport = {
  themeColor: '#0A1628',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#050D1A' }}>
        {children}
      </body>
    </html>
  );
}
