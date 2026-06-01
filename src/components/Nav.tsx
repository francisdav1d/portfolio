'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-full flex justify-center items-center py-8 md:py-17 px-4 bg-white">
      <div className="flex flex-col md:flex-row gap-6 md:gap-18 text-xs md:text-sm font-bold tracking-widest uppercase text-gray-400 items-center">
        <Link
          href="/"
          className={`transition-colors duration-300 ${pathname === '/' ? 'text-black' : 'hover:text-black'}`}
        >
          Work
        </Link>
        <Link
          href="/#showreel"
          className="hover:text-black transition-colors duration-300 flex items-center gap-2"
        >
          Showreel <span className="text-gray-400">✦</span> 2025
        </Link>
        <Link
          href="/contact"
          className={`transition-colors duration-300 ${pathname === '/contact' ? 'text-black' : 'hover:text-black'}`}
        >
          Contact
        </Link>
      </div>
    </nav>
  );
}
