import type { AppProps } from 'next/app';
import { Web3ReactProvider } from '@web3-react/core';
import { createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'viem';
import { MetaMask } from '@web3-react/metamask';
import { hooks as metaMaskHooks, metaMask } from '../connectors/metaMask';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/app/globals.css';
import { Inter, Poppins } from 'next/font/google';

const queryClient = new QueryClient();

const connectors: [MetaMask, typeof metaMaskHooks][] = [
  [metaMask, metaMaskHooks],
];

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display'
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.className} ${poppins.variable}`}>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={config}>
          <Web3ReactProvider connectors={connectors}>
            <Component {...pageProps} />
          </Web3ReactProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </main>
  );
}
