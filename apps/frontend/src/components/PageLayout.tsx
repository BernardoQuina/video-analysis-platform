import { ReactNode } from 'react';

import { Header } from './Header';

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="py-4">{children}</main>
    </>
  );
}
