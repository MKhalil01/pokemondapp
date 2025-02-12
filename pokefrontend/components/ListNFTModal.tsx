import React, { useState } from 'react';
import { NFTData } from './PokemonCard';

interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedNFTs: NFTData[];
  onListNFT: (tokenId: number, price: number) => Promise<void>;
}

const ListNFTModal = ({ isOpen, onClose, ownedNFTs, onListNFT }: ListNFTModalProps) => {
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
  const [price, setPrice] = useState<string>('');
  const [isListing, setIsListing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNFT || !price) return;

    setIsListing(true);
    try {
      await onListNFT(selectedNFT.tokenId, parseFloat(price));
      onClose();
    } catch (error) {
      console.error('Error listing NFT:', error);
    } finally {
      setIsListing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">List NFT for Sale</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NFT Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Pokemon NFT
              </label>
              <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {ownedNFTs.map((nft) => (
                  <div
                    key={nft.tokenId}
                    onClick={() => setSelectedNFT(nft)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedNFT?.tokenId === nft.tokenId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <img
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="w-full h-24 object-contain mb-2"
                    />
                    <p className="text-sm font-medium text-center">{nft.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedNFT || !price || isListing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isListing ? 'Listing...' : 'List NFT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListNFTModal;
