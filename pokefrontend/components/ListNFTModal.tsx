import React, { useState } from 'react';

interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedNFTs: {
    tokenId: number;
    name: string;
    image: string;
    rarity: string;
    stats: {
      hp: number;
      attack: number;
      defense: number;
      speed: number;
      spAttack: number;
      spDefense: number;
    };
  }[];
  onListNFT: (tokenId: number, price: number) => void;
}

const ListNFTModal: React.FC<ListNFTModalProps> = ({ isOpen, onClose, ownedNFTs, onListNFT }) => {
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);
  const [price, setPrice] = useState<string>('');

  return (
    <div className={`fixed inset-0 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">List NFT for Sale</h2>
            
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {ownedNFTs.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className={`cursor-pointer rounded-lg p-2 border-2 ${
                      selectedNFT === nft.tokenId ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedNFT(nft.tokenId)}
                  >
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-24 object-contain"
                    />
                    <div className="mt-2 text-center">
                      <div className="font-semibold text-sm">{nft.name}</div>
                      <div className="text-xs text-gray-500">#{nft.tokenId}</div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedNFT && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter price in ETH"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-4 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedNFT && price) {
                    onListNFT(selectedNFT, parseFloat(price));
                    onClose();
                  }
                }}
                disabled={!selectedNFT || !price}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                List NFT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListNFTModal;
