// Using the injectedconnector and walletconnectconnecto to connect to metamask

import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions, options: { supportedChainIds: [1337] } })
)

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

export { metaMask, hooks }
