import type { AppProps } from 'next/app';
import { WagmiConfig } from 'wagmi';
import { config } from '../connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/app/globals.css';
import { Inter, Poppins } from 'next/font/google';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display'
});

// Create a client for React Query
const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <main className={`${inter.className} ${poppins.variable}`}>
          <Component {...pageProps} />
        </main>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

// Prevent SSR for the entire app since wagmi isn't SSR-friendly
export default dynamic(() => Promise.resolve(App), {
  ssr: false
});
