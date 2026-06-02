'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-full flex justify-center items-center py-6 md:py-8 lg:py-12 xl:py-17 px-4 bg-white">
      <div className="flex flex-col md:flex-row gap-5 md:gap-8 lg:gap-12 xl:gap-18 text-xs md:text-sm font-bold tracking-widest uppercase text-gray-400 items-center">
        <Link
          href="/"
          className={`transition-colors duration-300 ${pathname === '/' ? 'text-black' : 'hover:text-black'}`}
        >
          Work
        </Link>
        <Link
          href="/#testimonials"
          className="hover:text-black transition-colors duration-300 cursor-pointer"
          onClick={(e) => {
            // Only intercept and smooth-scroll if we are already on the homepage
            if (pathname === '/') {
              e.preventDefault();
              document.querySelector('#testimonials')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Testimonials
        </Link>
        <Link
          href="/contact"
          className={`transition-colors duration-300 ${pathname === '/contact' ? 'text-black' : 'hover:text-black'}`}
        >
          Contact
        </Link>
        <Link
          href="https://ytjobs.co/@francisdavid"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-300 hover:text-black"
        >
          YT Jobs
        </Link>
      </div>
    </nav>
  );
}
