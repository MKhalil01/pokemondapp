import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ListNFTModalProps {
  onClose: () => void;
}

const ListNFTModal: React.FC<ListNFTModalProps> = ({ onClose }) => {
  const [listingType, setListingType] = useState<'Fixed' | 'Auction'>('Fixed');
  const [price, setPrice] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Integrate with PokemonTrading.sol here.
    console.log(`Listing NFT as ${listingType} for ${price} ETH`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg p-6 w-80"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <h3 className="text-xl font-bold mb-4">List NFT for Sale</h3>
          <div className="flex mb-4">
            <button
              className={`flex-1 px-3 py-2 rounded-l ${
                listingType === 'Fixed' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setListingType('Fixed')}
            >
              Fixed Price
            </button>
            <button
              className={`flex-1 px-3 py-2 rounded-r ${
                listingType === 'Auction' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setListingType('Auction')}
            >
              Auction
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              step="0.01"
              placeholder="Price in ETH"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 mb-4"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                List NFT
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ListNFTModal;
