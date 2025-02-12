// components/TradingMarketplace.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ListNFTModal from './ListNFTModal';

interface MarketplaceItem {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  saleEnd: Date;
}

// Here we need to link to the metadata of the NFTs that the user has minted, save this for later
const dummyListings: MarketplaceItem[] = [
  {
    id: 1,
    name: 'Bulbasaur',
    imageUrl: 'https:/testtest.com',
    price: 0.1,
    saleEnd: new Date(Date.now() + 3600 * 1000),
  },
  {
    id: 2,
    name: 'Squirtle',
    imageUrl: 'https:/testtest.com',
    price: 0.12,
    saleEnd: new Date(Date.now() + 7200 * 1000),
  },
];

const TradingMarketplace: React.FC = () => {
  const [listings, setListings] = useState<MarketplaceItem[]>(dummyListings);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [now, setNow] = useState<Date | null>(null);

  // Update the countdown timers every second.
  useEffect(() => {
    setNow(new Date()); // Set initial time
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeRemaining = (end: Date) => {
    if (!now) return '...'; // Initial loading state
    
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <section className="mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Marketplace</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          List NFT
        </button>
      </div>
      <div className="space-y-4">
        {listings.map((item) => (
          <motion.div
            key={item.id}
            className="flex items-center p-4 bg-white rounded shadow"
            whileHover={{ scale: 1.02 }}
          >
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded mr-4" />
            <div className="flex-1">
              <h3 className="font-bold text-black">{item.name}</h3>
              <p className="text-black">{item.price} ETH</p>
              <p className="text-sm text-black">Ends in: {formatTimeRemaining(item.saleEnd)}</p>
            </div>
            <div className="space-x-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                Bid
              </button>
              <button className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition">
                Offer
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {showModal && <ListNFTModal onClose={() => setShowModal(false)} />}
    </section>
  );
};

export default TradingMarketplace;
