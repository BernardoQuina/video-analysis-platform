import { ReactNode } from 'react';
import Head from 'next/head';

import { Header } from './Header';

export function PageLayout({
  children,
  pageTitle,
  pageDescription,
}: {
  children: ReactNode;
  pageTitle: string;
  pageDescription: string;
}) {
  return (
    <div className="items-center">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>
      <Header />
      <main className="w-full max-w-[80rem] px-2 py-4 md:px-4 lg:px-8">
        {children}
      </main>
    </div>
  );
}
