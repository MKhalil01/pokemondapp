// components/TradingMarketplace.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import CountdownTimer from './CountdownTimer';
import { useAccount } from 'wagmi';
import BidModal from './BidModal';

type SaleType = 'fixed' | 'auction';

interface Sale {
  tokenId: number;
  seller: string;
  price: number;
  saleType: SaleType;
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
  // Auction specific fields
  minimumBid?: number;
  highestBid?: number;
  highestBidder?: string;
  endTime?: number;
}

interface TradingMarketplaceProps {
  activeSales: Sale[];
  onCancelSale: (tokenId: number) => void;
  onPlaceBid: (tokenId: number, bidAmount: number) => void;
}

const TradingMarketplace: React.FC<TradingMarketplaceProps> = ({ 
  activeSales, 
  onCancelSale,
  onPlaceBid 
}) => {
  const { address } = useAccount();
  const [selectedAuction, setSelectedAuction] = useState<Sale | null>(null);

  const isOwner = (seller: string) => 
    address && seller.toLowerCase() === address.toLowerCase();

  const handleActionClick = (sale: Sale) => {
    if (sale.saleType === 'auction') {
      setSelectedAuction(sale);
    } else {
      // TODO: Handle fixed price purchase
      console.log('Purchasing NFT at fixed price:', sale.price);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Pokemon Trading Marketplace</h1>
      
      {activeSales.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No active listings at the moment
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeSales.map((sale) => (
            <div 
              key={sale.tokenId} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img 
                src={sale.image} 
                alt={sale.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{sale.name}</h3>
                  <span className="text-sm text-gray-500">#{sale.tokenId}</span>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600">
                    Seller: {sale.seller.slice(0, 6)}...{sale.seller.slice(-4)}
                  </div>
                  {sale.saleType === 'fixed' ? (
                    <div className="text-lg font-bold text-blue-600">{sale.price} ETH</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-sm">Minimum Bid: {sale.minimumBid} ETH</div>
                      <div className="text-sm">
                        Highest Bid: {sale.highestBid ? `${sale.highestBid} ETH` : 'No bids yet'}
                      </div>
                      <div className="text-sm">
                        Time Remaining: <CountdownTimer endTime={sale.endTime!} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {isOwner(sale.seller) ? (
                    <button
                      onClick={() => onCancelSale(sale.tokenId)}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 
                                transition-colors"
                    >
                      Cancel Sale
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActionClick(sale)}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 
                                transition-colors"
                    >
                      {sale.saleType === 'fixed' ? 'Buy Now' : 'Place Bid'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAuction && (
        <BidModal
          isOpen={!!selectedAuction}
          onClose={() => setSelectedAuction(null)}
          tokenId={selectedAuction.tokenId}
          nftName={selectedAuction.name}
          image={selectedAuction.image}
          minimumBid={selectedAuction.minimumBid || 0}
          highestBid={selectedAuction.highestBid || 0}
          onPlaceBid={onPlaceBid}
        />
      )}
    </div>
  );
};

export default TradingMarketplace;
