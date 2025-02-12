import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from '../connectors';

const Header: React.FC = () => {
  const { connector, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { account } = useWeb3React();

  const connectWallet = async () => {
    try {
      await connect({ connector: injected });
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="flex justify-between items-center p-4 bg-yellow-300 shadow-md">
      <div className="flex items-center">
        <img src="/pokeball.svg" alt="Pokeball Icon" className="w-8 h-8 mr-2 animate-spin-slow" />
        <h1 className="text-2xl font-bold text-gray-900">UCL DeFi Pokemon dApp</h1>
      </div>
      <button
        onClick={isConnected ? () => disconnect() : connectWallet}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {isConnected && account ? `Connected: ${formatAddress(account)}` : 'Connect Wallet'}
      </button>
    </header>
  );
};

export default Header;
