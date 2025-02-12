// components/MintingInterface.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContractWrite } from 'wagmi';
import { useAccount, useNetwork } from 'wagmi';
import PokemonNFTAbi from '../abis/PokemonNFT.json';


const MINT_PRICE = 0.08; // ETH per NFT

const MintingInterface = () => {
  const [quantity, setQuantity] = useState<string>('1');
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [particles, setParticles] = useState<number[]>([]);

  // Replace the usePrepareContractWrite section with direct useContractWrite
  const { write: mint } = useContractWrite({
    address: process.env.NEXT_PUBLIC_POKEMON_NFT_ADDRESS as `0x${string}`,
    abi: PokemonNFTAbi,
    functionName: 'mint',
    args: [parseInt(quantity) || 0],
    value: BigInt((parseInt(quantity) || 0) * MINT_PRICE * 1e18),
  });

  const handleMint = async () => {
    if (!mint || !parseInt(quantity)) return;
    setIsMinting(true);
    spawnParticles();
    try {
      await mint();
    } catch (error) {
      console.error('Minting error:', error);
    }
    setIsMinting(false);
  };

  const spawnParticles = () => {
    // Spawn 10 particles for the effect
    setParticles(Array.from({ length: 10 }, (_, i) => i));
    setTimeout(() => setParticles([]), 1000);
  };

  const totalPrice = ((parseInt(quantity) || 0) * MINT_PRICE).toFixed(2);

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full">
        <h2 className="text-3xl font-bold mb-8 text-center">Mint your Pokemon NFT</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity:
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
          
          <div className="flex justify-between items-center py-4 border-t border-b border-gray-200">
            <span className="text-lg font-medium text-gray-700">Total Price:</span>
            <span className="text-2xl font-bold">{totalPrice} ETH</span>
          </div>
          
          <button
            onClick={handleMint}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-md transition duration-200 text-lg"
          >
            {isMinting ? 'Minting...' : 'Mint Pokemon'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MintingInterface;
