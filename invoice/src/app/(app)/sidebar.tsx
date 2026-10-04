'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Banknote,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { logout } from '../(auth)/actions';

type NavItem = { href: string; label: string; icon: typeof FileText; badge?: number };

export function Sidebar({
  user,
  pendingCount,
}: {
  user: { name: string; email: string; role: 'OWNER' | 'FREELANCER' };
  pendingCount: number;
}) {
  const pathname = usePathname();
  const owner = user.role === 'OWNER';

  const items: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/invoices', label: owner ? 'Invoices' : 'My invoices', icon: FileText },
    { href: '/inbox', label: 'Inbox', icon: Inbox, badge: pendingCount },
    ...(owner
      ? [
          { href: '/clients', label: 'Clients', icon: UserRound },
          { href: '/freelancers', label: 'Freelancers', icon: UsersRound },
        ]
      : []),
    { href: '/payments', label: 'Payments', icon: Banknote },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="no-print border-b border-zinc-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-4 py-3 lg:px-5 lg:py-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="rounded-md bg-brand-600 p-1 text-white">
            <FileText className="size-4" />
          </span>
          <span className="font-semibold tracking-tight">Invoices</span>
        </Link>
        <form action={logout} className="lg:hidden">
          <button className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100" aria-label="Sign out">
            <LogOut className="size-4" />
          </button>
        </form>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-brand-50 text-brand-700' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-zinc-100 p-4 lg:block">
        <div className="mb-3 min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-brand-600">
            {user.role === 'OWNER' ? 'Owner' : 'Freelancer'}
          </p>
        </div>
        <form action={logout}>
          <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100">
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
