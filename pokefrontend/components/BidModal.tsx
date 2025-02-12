import React, { useState } from 'react';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  nftName: string;
  image: string;
  minimumBid: number;
  highestBid: number;
  onPlaceBid: (tokenId: number, bidAmount: number) => void;
}

const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  tokenId,
  nftName,
  image,
  minimumBid,
  highestBid,
  onPlaceBid,
}) => {
  const minRequired = Math.max(minimumBid, highestBid || 0);
  const [bidAmount, setBidAmount] = useState<string>(minRequired.toString());

  const handleSubmit = () => {
    const amount = parseFloat(bidAmount);
    if (amount > minRequired) {
      onPlaceBid(tokenId, amount);
      onClose();
      setBidAmount(minRequired.toString());
    }
  };

  return (
    <div className={`fixed inset-0 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Place Bid</h2>
            
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <img 
                  src={image} 
                  alt={nftName}
                  className="w-24 h-24 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold text-lg">{nftName}</h3>
                  <p className="text-sm text-gray-500">#{tokenId}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Highest Bid
                </label>
                <p className="text-lg font-semibold">
                  {highestBid ? `${highestBid} ETH` : 'No bids yet'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Required Bid: {minRequired} ETH
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bidAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value >= 0 || e.target.value === '') {
                      setBidAmount(e.target.value);
                    }
                  }}
                  className="w-full p-2 border rounded"
                  placeholder={`Enter bid amount (current highest: ${minRequired} ETH)`}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') {
                      e.preventDefault();
                    }
                  }}
                />
                {bidAmount && parseFloat(bidAmount) <= minRequired && (
                  <p className="mt-1 text-sm text-red-500">
                    Bid must be higher than {minRequired} ETH
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!bidAmount || parseFloat(bidAmount) <= minRequired}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                          transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Bid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidModal; 