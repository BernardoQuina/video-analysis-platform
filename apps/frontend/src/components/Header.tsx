import { Focus } from 'lucide-react';
import Link from 'next/link';

import { GoogleSignIn } from './GoogleSignIn';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 dark:border-border sticky top-0 z-50 h-14 w-full items-center justify-center border-b backdrop-blur">
      <div className="w-full max-w-[80rem] flex-row justify-between px-2 md:px-4 lg:px-8">
        <Link href="/" className="flex-row items-center gap-2">
          <Focus />
          <h1 className="text-sm font-bold">VIDEO ANALYSIS DEMO</h1>
        </Link>
        <div className="flex-row gap-2">
          <ThemeToggle />
          <GoogleSignIn />
        </div>
      </div>
    </header>
  );
}
