// Using the injectedconnector and walletconnectconnecto to connect to metamask

import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

// Forge's Anvil local network has chain ID 1337 and RPC url http://localhost:8545
export const injected = new InjectedConnector({ supportedChainIds: [1337] });

export const walletconnect = new WalletConnectConnector({
  rpc: {
    1337: "http://localhost:8545"
  },
  qrcode: true,
});
