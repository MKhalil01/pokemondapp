import type { AppProps } from 'next/app';
import { Web3ReactProvider } from '@web3-react/core';
import { metaMask, hooks } from '../connectors';
import { createConfig, WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import '../src/app/globals.css';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display'
});

const connectors: [MetaMask, typeof hooks][] = [[metaMask, hooks]];

// Create a client for React Query
const queryClient = new QueryClient();

// Configure Wagmi for the local Anvil network
const config = createConfig({
  chains: [{
    id: 1337,
    name: 'Anvil Local Network',
    network: 'anvil',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { 
        http: ['http://localhost:8545']
      },
      public: {
        http: ['http://localhost:8545']
      }
    }
  }],
  transports: {
    1337: http('http://localhost:8545'),
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <Web3ReactProvider connectors={connectors}>
          <main className={`${inter.className} ${poppins.variable}`}>
            <Component {...pageProps} />
          </main>
        </Web3ReactProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
