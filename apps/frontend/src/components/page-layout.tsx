import { ReactNode } from 'react';
import Head from 'next/head';

import { Header } from './header';

export function PageLayout({
  children,
  pageTitle,
  pageDescription,
  backgroundEffects = false,
}: {
  children: ReactNode;
  pageTitle: string;
  pageDescription: string;
  backgroundEffects?: boolean;
}) {
  return (
    <div className="items-center overflow-x-clip">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Head>
      <Header />
      <main className="w-full max-w-[70rem] px-4 py-4 lg:px-8">{children}</main>
      {backgroundEffects && (
        <>
          <div className="bg-background/95 supports-[backdrop-filter]:bg-background/50 dark:supports-[backdrop-filter]:bg-background/70 fixed -z-10 h-full w-full backdrop-blur-3xl"></div>

          <div className="blob animate-blob1 fixed left-1/3 top-1/4 -z-20 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-red-400 via-purple-500 to-blue-500 opacity-50 dark:from-red-600 dark:via-purple-700 dark:to-blue-700"></div>
          <div className="blob animate-blob2 fixed bottom-1/4 right-1/3 -z-20 h-[700px] w-[700px] translate-x-1/2 translate-y-1/2 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 opacity-50 dark:from-blue-600 dark:via-purple-700 dark:to-cyan-600"></div>
        </>
      )}
    </div>
  );
}
