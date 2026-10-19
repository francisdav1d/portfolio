'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Nav() {
  const pathname = usePathname();

  // On phones the nav is one compact row that sticks to the top while scrolling, with
  // finger-sized (44px) tap targets. From md up it's the original roomy, static nav.
  const linkClass = "inline-flex items-center min-h-11 px-0.5 md:min-h-0 md:px-0 transition-colors duration-300";

  return (
    <nav className="sticky top-0 z-40 md:static w-full flex justify-center items-center py-2.5 md:py-8 lg:py-12 xl:py-17 px-2 md:px-4 bg-white border-b border-neutral-100 md:border-b-0">
      <div className="w-full max-w-md md:w-auto md:max-w-none flex flex-row flex-wrap justify-evenly md:justify-center gap-x-1 sm:gap-x-6 md:gap-8 lg:gap-12 xl:gap-18 text-xs md:text-sm font-bold tracking-widest uppercase text-gray-400 items-center">
        <Link
          href="/"
          className={`${linkClass} ${pathname === '/' ? 'text-black' : 'hover:text-black'}`}
          onClick={(e) => {
            // Already on the homepage: smooth-scroll to the work grid instead of reloading
            if (pathname === '/') {
              e.preventDefault();
              document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Work
        </Link>
        <Link
          href="/#testimonials"
          className={`${linkClass} hover:text-black cursor-pointer`}
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
          className={`${linkClass} ${pathname === '/contact' ? 'text-black' : 'hover:text-black'}`}
        >
          Contact
        </Link>
        <Link
          href="https://ytjobs.co/@francisdavid"
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} hover:text-black`}
        >
          YT Jobs
        </Link>
      </div>
    </nav>
  );
}
