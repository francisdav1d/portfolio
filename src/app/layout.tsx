import '../styles/tailwind.css';
import '../styles/theme.css';
import '../styles/fonts.css';
import { Metadata } from 'next';
import clsx from 'clsx';
import localFont from 'next/font/local';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { Analytics } from '@vercel/analytics/react';

const ydFont = localFont({
  src: '../../public/fonts/YDYoonche.woff2',
  variable: '--font-yd',
});

export const metadata: Metadata = {
  title: 'Editor francisdavid',
  description: 'Francis David - Video Editor specializing in long form YouTube videos.',
  keywords: ['Francis David', 'FrancisDavid', 'Video Editor', 'Portfolio', 'Cinematic', 'Creative Director', 'Filmmaker'],
  authors: [{ name: 'Francis David' }],
  creator: 'Francis David',
  openGraph: {
    title: 'Editor francisdavid',
    description: 'Francis David - Video Editor specializing in long form YouTube videos.',
    url: 'https://francisdavid.me',
    siteName: 'Francis David Portfolio',
    type: 'website',
    images: [
      {
        url: 'https://francisdavid.me/images/website_working.png',
        width: 1200,
        height: 630,
        alt: 'Francis David Portfolio Preview',
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Editor francisdavid',
    description: 'Francis David - Video Editor specializing in long form YouTube videos.',
    images: ['https://francisdavid.me/images/website_working.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ydFont.variable}>
      <body className={clsx("bg-white text-black min-h-screen antialiased overflow-x-hidden font-sans")}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Analytics />
      </body>
    </html>
  );
}
