import React, { useState } from 'react';

type SaleType = 'fixed' | 'auction';

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
  onListNFT: (tokenId: number, price: number, saleType: SaleType) => void;
  isLoading?: boolean;
  error?: string | null;
}

const ListNFTModal: React.FC<ListNFTModalProps> = ({
  isOpen,
  onClose,
  ownedNFTs,
  onListNFT,
  isLoading,
  error
}) => {
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);
  const [saleType, setSaleType] = useState<SaleType>('fixed');
  const [price, setPrice] = useState<string>('');

  const handleSubmit = () => {
    if (selectedNFT && price) {
      onListNFT(selectedNFT, parseFloat(price), saleType);
      onClose();
      // Reset form
      setSelectedNFT(null);
      setPrice('');
      setSaleType('fixed');
    }
  };

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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSaleType('fixed')}
                        className={`py-2 px-4 text-sm rounded-md ${
                          saleType === 'fixed'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Fixed Price
                      </button>
                      <button
                        type="button"
                        onClick={() => setSaleType('auction')}
                        className={`py-2 px-4 text-sm rounded-md ${
                          saleType === 'auction'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Auction
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {saleType === 'fixed' ? 'Price (ETH)' : 'Minimum Bid (ETH)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0 || e.target.value === '') {
                          setPrice(e.target.value);
                        }
                      }}
                      className="w-full p-2 border rounded"
                      placeholder={saleType === 'fixed' ? 'Enter price in ETH' : 'Enter minimum bid in ETH'}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                    />
                    {saleType === 'auction' && (
                      <p className="mt-1 text-sm text-gray-500">
                        Auctions will run for 7 days from listing
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-2 bg-red-100 text-red-600 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-4 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !selectedNFT || !price}
                className={`w-full mt-4 px-4 py-2 rounded ${
                  isLoading || !selectedNFT || !price
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isLoading ? 'Processing...' : 'List NFT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListNFTModal;
