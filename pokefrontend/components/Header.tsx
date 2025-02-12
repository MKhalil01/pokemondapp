import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { metaMask } from '../connectors';
import { NETWORK_DETAILS } from '../connectors';

const Header: React.FC = () => {
  const { account, isActive } = useWeb3React();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    void metaMask.connectEagerly();
  }, []);

  const formatAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  async function connect() {
    try {
      setConnecting(true);
      await metaMask.activate();
      
      // Check if we need to add the network to MetaMask
      const provider = window.ethereum;
      if (provider) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_DETAILS.chainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [NETWORK_DETAILS],
              });
            } catch (addError) {
              console.error('Error adding network:', addError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error connecting:', error);
    } finally {
      setConnecting(false);
    }
  }

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
        
        <div>
          {isActive ? (
            <button 
              onClick={() => metaMask.deactivate()}
              className="bg-[#3B4CCA] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
            >
              {formatAddress(account)}
            </button>
          ) : (
            <button 
              onClick={connect} 
              disabled={connecting}
              className="bg-[#3B4CCA] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
