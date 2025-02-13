// components/MintingInterface.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  useContractWrite, 
  usePrepareContractWrite, 
  useContractEvent,
  useContractRead, 
  useAccount,
  useWaitForTransaction
} from 'wagmi';
import { parseEther } from 'viem';
import PokemonNFTAbi from '../abis/PokemonNFT.json';

const CONTRACT_ADDRESS = '0xf4F833c8649F913e251Bdec113bEFED33889e3d1';

const MintingInterface = () => {
  const { address, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Read mint price from contract
  const { data: mintPrice } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: PokemonNFTAbi,
    functionName: 'mintPrice',
    watch: true,
  }) as { data: bigint };

  // Prepare the mint transaction
  const { config: contractConfig, error: prepareError } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: PokemonNFTAbi,
    functionName: 'requestMint',
    args: [BigInt(quantity)],
    value: mintPrice ? mintPrice * BigInt(quantity) : BigInt(0),
    enabled: Boolean(address && mintPrice && quantity > 0),
  });

  const { write: mint, data: mintData, error: mintError } = useContractWrite(contractConfig);

  const { isLoading: isMinting, isSuccess: mintSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  // Watch for MintCompleted event
  useContractEvent({
    address: CONTRACT_ADDRESS,
    abi: PokemonNFTAbi,
    eventName: 'MintCompleted',
    listener(logs) {
      console.log('Mint completed:', logs);
    },
  });

  const handleMint = async () => {
    try {
      setError(null);
      if (!isConnected) {
        throw new Error('Please connect your wallet first');
      }
      if (!mint) {
        throw new Error('Minting not ready');
      }
      mint();
    } catch (err) {
      console.error('Minting error:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint');
    }
  };

  // Show any prepare or mint errors
  React.useEffect(() => {
    if (prepareError || mintError) {
      const errorMessage = (prepareError || mintError)?.message || 'Failed to mint';
      setError(errorMessage);
    }
  }, [prepareError, mintError]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Mint Pokemon NFT</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <label className="font-medium">Quantity:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded px-2 py-1"
          />
        </div>
        
        <div className="text-sm">
          Price: {mintPrice ? `${Number(mintPrice) / 10**18 * quantity} ETH` : 'Loading...'}
        </div>

        <button
          onClick={handleMint}
          disabled={!mint || isMinting || !isConnected}
          className={`px-4 py-2 rounded ${
            !mint || isMinting || !isConnected
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {!isConnected 
            ? 'Connect Wallet to Mint' 
            : isMinting 
              ? 'Minting...' 
              : 'Mint NFT'}
        </button>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {mintSuccess && (
          <div className="text-green-500 text-sm">
            Successfully minted! Check your wallet for the NFT.
          </div>
        )}
      </div>
    </div>
  );
};

export default MintingInterface;
