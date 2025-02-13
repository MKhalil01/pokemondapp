// Using the injectedconnector and walletconnectconnecto to connect to metamask

import { configureChains, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { createWeb3Modal } from '@web3modal/wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { InjectedConnector } from 'wagmi/connectors/injected'

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''
const alchemyApiKey = '70yAay7lR250X795Z4tF3xlQ49wNi14L'

// Configure chains with Alchemy provider
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia],
  [alchemyProvider({ apiKey: alchemyApiKey })]
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

// // Define Anvil chain
// const anvil = {
//   id: 31337,
//   name: 'Anvil',
//   network: 'anvil',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Ethereum',
//     symbol: 'ETH',
//   },
//   rpcUrls: {
//     default: { http: ['http://127.0.0.1:8545'] },
//     public: { http: ['http://127.0.0.1:8545'] },
//   },
// } as const


// 3. Create modal with more specific configuration
export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  themeMode: 'light',
  defaultChain: sepolia,
  featuredWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
  includeWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
})
