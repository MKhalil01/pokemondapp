import React, { useState } from 'react';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { parseEther } from 'viem';
import PokemonTradingAbi from '../abis/PokemonTrading.json';

const TRADING_CONTRACT_ADDRESS = '0xeD370F9777eAA47317e90803a6A3c0Ea540B0cE3';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: number;
  tokenId: number;
  nftName: string;
  image: string;
  rarity: string;
  minimumBid: number;
  currentHighestBid: number;
  isSeller: boolean;
}

const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  saleId,
  tokenId,
  nftName,
  image,
  rarity,
  minimumBid,
  currentHighestBid,
  isSeller,
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Prepare bid transaction
  const { config: bidConfig, error: prepareBidError } = usePrepareContractWrite({
    address: TRADING_CONTRACT_ADDRESS,
    abi: PokemonTradingAbi,
    functionName: 'bid',
    args: [BigInt(saleId)],
    value: parseEther(bidAmount || '0'),
    enabled: !isSeller && Boolean(bidAmount),
  });

  // Prepare accept bid transaction
  const { config: acceptConfig, error: prepareAcceptError } = usePrepareContractWrite({
    address: TRADING_CONTRACT_ADDRESS,
    abi: PokemonTradingAbi,
    functionName: 'acceptHighestBid',
    args: [BigInt(saleId)],
    enabled: isSeller,
  });

  const { write: placeBid, isLoading: isBidLoading } = useContractWrite(bidConfig);
  const { write: acceptBid, isLoading: isAcceptLoading } = useContractWrite(acceptConfig);

  const handleAction = async () => {
    try {
      setError(null);
      if (isSeller) {
        if (!acceptBid) throw new Error("Unable to accept bid at this time");
        await acceptBid();
      } else {
        if (!placeBid || !bidAmount) throw new Error("Unable to place bid at this time");
        if (parseFloat(bidAmount) <= currentHighestBid) {
          throw new Error("Bid must be higher than current highest bid");
        }
        if (parseFloat(bidAmount) < minimumBid) {
          throw new Error("Bid must be at least the minimum bid amount");
        }
        await placeBid();
      }
      onClose();
    } catch (err) {
      console.error('Error with bid action:', err);
      setError(err instanceof Error ? err.message : 'Failed to process bid action');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">
            {isSeller ? 'Accept Highest Bid' : 'Place Bid'}
          </h2>
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
          {!isSeller && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Bid Amount (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                min={minimumBid}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder={`Min bid: ${minimumBid} ETH`}
              />
            </div>
          )}
          
          <div className="text-sm text-gray-600 mb-2">
            Current Highest Bid: {currentHighestBid} ETH
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Minimum Bid: {minimumBid} ETH
          </div>
          
          {(error || prepareBidError || prepareAcceptError) && (
            <p className="text-center text-red-500 text-sm mt-2">
              {error || prepareBidError?.message || prepareAcceptError?.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isBidLoading || isAcceptLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={(!placeBid && !acceptBid) || isBidLoading || isAcceptLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                      transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isBidLoading || isAcceptLoading ? 'Processing...' : 
             isSeller ? 'Accept Highest Bid' : 'Place Bid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidModal; 