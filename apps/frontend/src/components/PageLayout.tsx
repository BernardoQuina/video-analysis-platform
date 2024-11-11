import { ReactNode } from 'react';

import { Header } from './Header';

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="items-center">
      <Header />
      <main className="w-full max-w-[80rem] px-2 py-4 md:px-4 lg:px-8">
        {children}
      </main>
    </div>
  );
}
