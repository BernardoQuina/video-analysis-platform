import '@xyflow/react/dist/style.css';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { ThemeProvider } from '../components/theme-provider';
import { trpc } from '../utils/trpc';
import { Toaster } from '../components/ui/sonner';

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      enableSystem
      disableTransitionOnChange
      defaultTheme="system"
    >
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  );
}

export default trpc.withTRPC(App);
