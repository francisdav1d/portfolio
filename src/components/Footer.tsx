'use client';

import { SocialLinks } from './SocialLinks';

export function Footer({ hideSocials = false }: { hideSocials?: boolean }) {
  return (
    <footer className="py-12 px-6 bg-white w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-10">
          {!hideSocials && (
            <SocialLinks />
          )}
          <p className="text-xs text-gray-400 font-sans tracking-wide">
            Copyright © 2026 Francis David
          </p>
        </div>
      </div>
    </footer>
  );
}
