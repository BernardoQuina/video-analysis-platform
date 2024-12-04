import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { ThemeProvider } from '../components/theme-provider';
import { trpc } from '../utils/trpc';
import { Toaster } from '../components/ui/sonner';
import { ScrollToTop } from '../components/scroll-to-top';

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      enableSystem
      disableTransitionOnChange
      defaultTheme="system"
    >
      <ScrollToTop /> {/* See comments in this component file */}
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  );
}

export default trpc.withTRPC(App);
