import React, { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import PokemonTradingAbi from '../abis/PokemonTrading.json';
import PokemonNFTAbi from '../abis/PokemonNFT.json';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  nftName: string;
  image: string;
  rarity: string;
}

const TRADING_CONTRACT_ADDRESS = '0xeD370F9777eAA47317e90803a6A3c0Ea540B0cE3';
const NFT_CONTRACT_ADDRESS = '0xf4F833c8649F913e251Bdec113bEFED33889e3d1';

const ListingModal: React.FC<ListingModalProps> = ({
  isOpen,
  onClose,
  tokenId,
  nftName,
  image,
  rarity,
}) => {
  const { address } = useAccount();
  const [price, setPrice] = useState<string>('');
  const [saleType, setSaleType] = useState<'FixedPrice' | 'Auction'>('FixedPrice');
  const [error, setError] = useState<string | null>(null);

  // Prepare approval for trading contract
  const { config: approvalConfig } = usePrepareContractWrite({
    address: NFT_CONTRACT_ADDRESS,
    abi: PokemonNFTAbi,
    functionName: 'approve',
    args: [TRADING_CONTRACT_ADDRESS, BigInt(tokenId)],
    enabled: Boolean(address && tokenId),
  });

  // Prepare listing transaction
  const { config: listingConfig } = usePrepareContractWrite({
    address: TRADING_CONTRACT_ADDRESS,
    abi: PokemonTradingAbi,
    functionName: saleType === 'FixedPrice' ? 'createFixedPriceSale' : 'createAuctionSale',
    args: [BigInt(tokenId), parseEther(price || '0')],
    enabled: Boolean(address && tokenId && price),
});

  const { write: approve } = useContractWrite(approvalConfig);
  const { write: createListing } = useContractWrite(listingConfig);

  const handleList = async () => {
    try {
      if (!price || parseFloat(price) <= 0) {
        throw new Error('Please enter a valid price');
      }
      
      // First approve the trading contract
      await approve?.();
      
      // Then create the listing
      await createListing?.();
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">List {nftName} for Sale</h2>
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Type
            </label>
            <select
              value={saleType}
              onChange={(e) => setSaleType(e.target.value as 'FixedPrice' | 'Auction')}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="FixedPrice">Fixed Price</option>
              <option value="Auction">Auction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {saleType === 'FixedPrice' ? 'Price' : 'Starting Price'} (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="0.00"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            onClick={handleList}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            List for Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingModal; 