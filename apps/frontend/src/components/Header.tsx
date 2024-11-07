import { GoogleSignIn } from './GoogleSignIn';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 dark:border-border sticky top-0 z-50 flex h-14 w-full items-center justify-end gap-2 border-b px-4 backdrop-blur">
      <ThemeToggle />
      <GoogleSignIn />
    </header>
  );
}
