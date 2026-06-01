import { Link } from 'react-router';

export function Nav() {
  return (
    <nav className="flex items-center justify-center gap-8 py-6 px-6 border-b border-gray-200">
      <Link to="/" className="text-sm font-bold tracking-wide text-gray-400 hover:text-black transition-colors">
        WORK
      </Link>
      <Link to="/" className="text-sm font-bold tracking-wide text-gray-400 hover:text-black transition-colors">
        SHOWREEL ✦ 2025
      </Link>
      <Link to="/contact" className="text-sm font-bold tracking-wide text-black transition-colors">
        CONTACT
      </Link>
    </nav>
  );
}
