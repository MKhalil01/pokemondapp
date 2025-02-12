// Using the injectedconnector and walletconnectconnecto to connect to metamask

import { configureChains, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { createWeb3Modal } from '@web3modal/wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { InjectedConnector } from 'wagmi/connectors/injected'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// 2. Configure wagmi client
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [publicProvider()]
)

const metadata = {
  name: 'Pokemon NFT dApp',
  description: 'Mint and trade Pokemon NFTs',
  url: 'https://pokemon-nft.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Configure both MetaMask (injected) and WalletConnect connectors
export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'MetaMask',
        shimDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
        metadata,
        showQrModal: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

// Define Anvil chain
const anvil = {
  id: 31337,
  name: 'Anvil',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
} as const

// 3. Create modal with more specific configuration
export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  themeMode: 'light',
  defaultChain: anvil, // Set anvil as default
  featuredWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
  includeWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
})

// Local Anvil network configuration
export const NETWORK_DETAILS = {
  chainId: '0x539', // 1337 in hex
  chainName: 'Anvil Local Network',
  rpcUrls: ['http://localhost:8545'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
}
