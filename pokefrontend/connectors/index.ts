// Using the injectedconnector and walletconnectconnecto to connect to metamask

import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: process.env.NEXT_PUBLIC_RPC_URL! },
  qrcode: true,
});
