import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from '../connectors';

const Header = () => {
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
    <header className="bg-[#FFCB05] py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img 
            src="/pokeball.svg" 
            alt="Pokeball" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#3B4CCA]">
            UCL DeFi Pokemon dApp
          </h1>
        </div>
        
        <button 
          onClick={connectWallet}
          className="bg-[#3B4CCA] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
        >
          {isConnected ? formatAddress(account) : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};

export default Header;
