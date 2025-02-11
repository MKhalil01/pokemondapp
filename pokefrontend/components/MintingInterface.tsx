// components/MintingInterface.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import PokemonNFTAbi from '.../nftmaker/metadata_files/metadata_1.json'; //random pokemon for now


const MINT_PRICE = 0.08; // ETH per NFT

const MintingInterface: React.FC = () => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [particles, setParticles] = useState<number[]>([]);

  // Prepare the contract call (make sure NEXT_PUBLIC_POKEMON_NFT_ADDRESS is set)
  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_POKEMON_NFT_ADDRESS as `0x${string}`,
    abi: PokemonNFTAbi,
    functionName: 'mint',
    args: [quantity],
    overrides: {
      // convert ETH value to wei (BigInt)
      value: BigInt(quantity * MINT_PRICE * 1e18),
    },
  });

  const { writeAsync: mint } = useContractWrite(config);

  const handleMint = async () => {
    if (!mint) return;
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

  return (
    <div className="my-8 p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4 text-red-600">Mint your Pokemon NFT</h2>
      <div className="flex items-center space-x-4">
        <span className="font-medium">Quantity:</span>
        {[1, 3, 5].map((q) => (
          <button
            key={q}
            onClick={() => setQuantity(q)}
            className={`px-4 py-2 border rounded ${
              quantity === q ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {q}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-lg">
          Total Price: <span className="font-bold">{(quantity * MINT_PRICE).toFixed(2)} ETH</span>
        </p>
      </div>
      <div className="relative mt-6">
        <motion.button
          onClick={handleMint}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isMinting}
          className="relative z-10 w-full bg-red-500 text-white py-3 rounded shadow-lg hover:bg-red-600 transition"
        >
          {isMinting ? 'Minting...' : 'Mint Pokemon'}
        </motion.button>
        <AnimatePresence>
          {particles.map((id) => (
            <motion.div
              key={id}
              initial={{ opacity: 1, y: 0, x: 0 }}
              animate={{ opacity: 0, y: -50, x: Math.random() * 100 - 50 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              style={{ top: 0, left: '50%' }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MintingInterface;
