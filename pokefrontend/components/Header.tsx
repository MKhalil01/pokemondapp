import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { web3Modal } from '../connectors';

const Header: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

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
        
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <span className="bg-white px-4 py-2 rounded-lg font-medium text-[#3B4CCA]">
                {formatAddress(address)}
              </span>
              <button 
                onClick={() => disconnect()}
                className="bg-[#3B4CCA] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
              >
                Disconnect
              </button>
            </>
          ) : (
            <w3m-button />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
