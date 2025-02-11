import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from '../connectors';

const Header: React.FC = () => {
  const { account, activate, deactivate, active } = useWeb3React();

  const connectWallet = async () => {
    try {
      // Here we simply try the injected connector (MetaMask)
      await activate(injected);
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-yellow-300 shadow-md">
      <div className="flex items-center">
        <img src="/pokeball.svg" alt="Pokeball Icon" className="w-8 h-8 mr-2 animate-spin-slow" />
        <h1 className="text-2xl font-bold text-blue-900">Pokemon NFT dApp</h1>
      </div>
      <button
        onClick={active ? deactivate : connectWallet}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {active && account
          ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
          : 'Connect Wallet'}
      </button>
    </header>
  );
};

export default Header;
