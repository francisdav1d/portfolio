'use client';

import { btn } from '@/components/ui';

export function PrintButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className={btn.secondary}>
      {children}
    </button>
  );
}
