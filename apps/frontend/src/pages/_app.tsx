import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { ThemeProvider } from '../components/theme-provider';
import { trpc } from '../utils/trpc';

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="system">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default trpc.withTRPC(App);
