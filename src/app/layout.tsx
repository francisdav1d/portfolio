import '../styles/tailwind.css';
import '../styles/theme.css';
import '../styles/fonts.css';
import { Metadata } from 'next';
import clsx from 'clsx';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

export const metadata: Metadata = {
  title: 'Francis David | Portfolio',
  description: 'Video editing portfolio of Francis David',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={clsx("bg-white text-black min-h-screen antialiased overflow-x-hidden")}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
