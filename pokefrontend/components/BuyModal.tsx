import React, { useState } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseEther } from 'viem';
import PokemonTradingAbi from '../abis/PokemonTrading.json';

const TRADING_CONTRACT_ADDRESS = '0xeD370F9777eAA47317e90803a6A3c0Ea540B0cE3';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: number;
  tokenId: number;
  nftName: string;
  image: string;
  rarity: string;
  price: number;
}

const BuyModal: React.FC<BuyModalProps> = ({
  isOpen,
  onClose,
  saleId,
  tokenId,
  nftName,
  image,
  rarity,
  price,
}) => {
  const [error, setError] = useState<string | null>(null);

  const { config, error: prepareError } = usePrepareContractWrite({
    address: TRADING_CONTRACT_ADDRESS,
    abi: PokemonTradingAbi,
    functionName: 'buy',
    args: [BigInt(saleId)],
    value: parseEther(price.toString()),
  });

  const { write: buyNFT, isLoading } = useContractWrite(config);

  const handleBuy = async () => {
    try {
      setError(null);
      if (!buyNFT) {
        throw new Error("Unable to buy NFT at this time");
      }
      await buyNFT();
      onClose();
    } catch (err) {
      console.error('Error buying NFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to buy NFT');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Buy Pokemon NFT</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <img src={image} alt={nftName} className="w-32 h-32 object-contain mx-auto" />
          <div className="text-center mt-2">
            <span className={`px-2 py-1 rounded-full text-sm ${
              rarity === 'Legendary' ? 'bg-purple-200' :
              rarity === 'Rare' ? 'bg-blue-200' :
              'bg-gray-200'
            }`}>
              {rarity}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-center text-gray-600">
            Are you sure you want to buy {nftName} for {price} ETH?
          </p>
          {(error || prepareError) && (
            <p className="text-center text-red-500 text-sm mt-2">
              {error || prepareError?.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleBuy}
            disabled={!buyNFT || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                      transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : `Buy for ${price} ETH`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal; 