// components/MintingInterface.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useContractWrite, 
  usePrepareContractWrite, 
  useContractEvent,
  useContractRead, 
  useAccount 
} from 'wagmi';
import { parseEther } from 'viem';
import PokemonNFTAbi from '../abis/PokemonNFT.json';

const MintingInterface = () => {
  const { address, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);

  // Read mint price from contract
  const { data: mintPrice } = useContractRead({
    address: process.env.NEXT_PUBLIC_POKEMON_NFT_ADDRESS as `0x${string}`,
    abi: PokemonNFTAbi,
    functionName: 'mintPrice',
  }) as { data: bigint };

  // Prepare the contract write
  const { config: contractConfig, error: prepareError } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_POKEMON_NFT_ADDRESS as `0x${string}`,
    abi: PokemonNFTAbi,
    functionName: 'requestMint',
    args: [BigInt(quantity)],
    value: mintPrice ? mintPrice * BigInt(quantity) : BigInt(0),
    enabled: Boolean(address && mintPrice),
  });

  const { write: mint, isLoading: isPending, data: txData } = useContractWrite(contractConfig);

  // Watch for MintCompleted event
  useContractEvent({
    address: process.env.NEXT_PUBLIC_POKEMON_NFT_ADDRESS as `0x${string}`,
    abi: PokemonNFTAbi,
    eventName: 'MintCompleted',
    listener(logs) {
      setMintSuccess(true);
      spawnParticles();
      setTimeout(() => setMintSuccess(false), 5000);
    },
  });

  console.log('Contract config:', {
    address: process.env.NEXT_PUBLIC_POKEMON_NFT_ADDRESS,
    mintPrice,
    hasAbi: !!PokemonNFTAbi,
    prepareError
  });

  const handleMint = async () => {
    if (!isConnected) {
      console.error('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      
      if (!address) {
        throw new Error('No wallet address');
      }
      if (!mintPrice) {
        throw new Error('Mint price not loaded');
      }
      if (!mint) {
        throw new Error('Mint function not available');
      }

      console.log('Pre-mint checks:', {
        hasAddress: !!address,
        hasMintPrice: !!mintPrice,
        canMint: !!mint
      });

      mint?.();
      
      console.log('Transaction data:', txData);

    } catch (error) {
      console.error('Detailed mint error:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const spawnParticles = () => {
    setParticles(Array.from({ length: 10 }, (_, i) => i));
    setTimeout(() => setParticles([]), 1000);
  };

  const totalPrice = mintPrice ? Number(mintPrice * BigInt(quantity)) / 1e18 : 0;

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
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-20 p-2 border rounded"
            />
          </div>
          
          <div className="flex justify-between items-center py-4 border-t border-b border-gray-200">
            <span className="text-lg font-medium text-gray-700">Total Price:</span>
            <span className="text-2xl font-bold">{totalPrice.toFixed(2)} ETH</span>
          </div>
          
          <button
            onClick={handleMint}
            disabled={isLoading || isPending || !mintPrice || !isConnected}
            className="w-full bg-[#3B4CCA] text-white font-bold py-4 px-6 rounded-md 
                     transition duration-200 text-lg disabled:opacity-50 hover:bg-opacity-90"
          >
            {!isConnected ? 'Connect Wallet First' :
             isLoading || isPending ? 'Minting...' : 'Mint Pokemon'}
          </button>
        </div>

        {mintSuccess && (
          <div className="mt-4 text-green-600 text-center">
            Successfully minted your Pokemon NFT!
          </div>
        )}

        <AnimatePresence>
          {particles.map((id) => (
            <motion.div
              key={id}
              initial={{ scale: 0, y: 0 }}
              animate={{ scale: 1, y: [-20, 20] }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MintingInterface;
