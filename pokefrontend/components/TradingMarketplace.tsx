// components/TradingMarketplace.tsx
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import CountdownTimer from './CountdownTimer';
import { useAccount, useContractRead } from 'wagmi';
import { readContract } from '@wagmi/core';
import { formatEther } from 'viem';
import PokemonTradingAbi from '../abis/PokemonTrading.json';
import PokemonNFTAbi from '../abis/PokemonNFT.json';
import CancelListingModal from './CancelListingModal';
import BuyModal from './BuyModal';
import BidModal from './BidModal';


const TRADING_CONTRACT_ADDRESS = '0xeD370F9777eAA47317e90803a6A3c0Ea540B0cE3';

type SaleType = 'fixed' | 'auction';

interface Sale {
  saleId: number;
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
  minimumBid?: number;
  highestBid?: number;
  highestBidder?: string;
  endTime?: number;
}

// Simplified props - removed trading-related props
interface TradingMarketplaceProps {
  activeSales: Sale[];
}

const TradingMarketplace: React.FC<TradingMarketplaceProps> = ({ activeSales }) => {
  const { address } = useAccount();
  const [contractSales, setContractSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBuySale, setSelectedBuySale] = useState<Sale | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedBidSale, setSelectedBidSale] = useState<Sale | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  // Keep only the read functionality
  const { data: saleCount } = useContractRead({
    address: TRADING_CONTRACT_ADDRESS,
    abi: PokemonTradingAbi,
    functionName: 'saleCount',
    watch: true,
  });

  // Fetch individual sale details
  useEffect(() => {
    const fetchSales = async () => {
      if (!saleCount) return;

      const salesPromises = [];
      for (let i = 0; i < Number(saleCount); i++) {
        const salePromise = (async () => {
          try {
            // First get the sale details from the contract
            const saleDetails = await readContract({
              address: TRADING_CONTRACT_ADDRESS,
              abi: PokemonTradingAbi,
              functionName: 'getSaleDetails',
              args: [BigInt(i)],
            });

            if (saleDetails && saleDetails.active) {
              // Then fetch the metadata
              const res = await fetch(`/metadata_files/metadata_${saleDetails.tokenId}.json`);
              const metadata = await res.json();
              
              const attributes = metadata.attributes.reduce((acc: any, curr: any) => {
                acc[curr.trait_type.toLowerCase()] = curr.value;
                return acc;
              }, {});

              return {
                saleId: i,
                tokenId: Number(saleDetails.tokenId),
                seller: saleDetails.seller,
                price: Number(formatEther(saleDetails.price)),
                saleType: saleDetails.saleType === 0 ? 'fixed' : 'auction',
                name: metadata.name,
                image: metadata.image,
                rarity: attributes.rarity || 'Common',
                stats: {
                  hp: attributes.hp || 50,
                  attack: attributes.attack || 50,
                  defense: attributes.defense || 50,
                  speed: attributes.speed || 50,
                  spAttack: attributes['special-attack'] || 50,
                  spDefense: attributes['special-defense'] || 50,
                },
                ...(saleDetails.saleType === 1 && {
                  minimumBid: Number(formatEther(saleDetails.price)),
                  highestBid: Number(formatEther(saleDetails.highestBid)),
                  highestBidder: saleDetails.highestBidder,
                  endTime: Number(saleDetails.endTime) * 1000,
                }),
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching sale ${i}:`, error);
            return null;
          }
        })();
        salesPromises.push(salePromise);
      }

      const sales = await Promise.all(salesPromises);
      setContractSales(sales.filter((sale): sale is Sale => sale !== null));
    };

    fetchSales();
  }, [saleCount]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Pokemon Marketplace Listings</h1>
      
      {contractSales.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No active listings at the moment
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {contractSales.map((sale, index) => (
            <div 
              key={sale.tokenId} 
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow
                ${sale.rarity === 'Legendary' ? 'ring-2 ring-purple-400' :
                  sale.rarity === 'Rare' ? 'ring-2 ring-blue-400' :
                  sale.rarity === 'Uncommon' ? 'ring-2 ring-green-400' : ''
                }`}
            >
              <Image 
                src={sale.image} 
                alt={sale.name}
                width={400}
                height={400}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{sale.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    sale.rarity === 'Legendary' ? 'bg-purple-200' :
                    sale.rarity === 'Rare' ? 'bg-blue-200' :
                    sale.rarity === 'Uncommon' ? 'bg-green-200' :
                    'bg-gray-200'
                  }`}>
                    {sale.rarity}
                  </span>
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

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span>HP:</span>
                    <span className="font-medium">{sale.stats.hp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ATK:</span>
                    <span className="font-medium">{sale.stats.attack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DEF:</span>
                    <span className="font-medium">{sale.stats.defense}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SPD:</span>
                    <span className="font-medium">{sale.stats.speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SP.A:</span>
                    <span className="font-medium">{sale.stats.spAttack}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SP.D:</span>
                    <span className="font-medium">{sale.stats.spDefense}</span>
                  </div>
                </div>

                {address?.toLowerCase() === sale.seller.toLowerCase() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      setSelectedSale(sale);
                      setIsCancelModalOpen(true);
                    }}
                    className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 
                              transition-colors font-medium"
                  >
                    Cancel Sale
                  </button>
                )}

                {sale.saleType === 'fixed' && sale.seller.toLowerCase() !== address?.toLowerCase() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBuySale(sale);
                      setIsBuyModalOpen(true);
                    }}
                    className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 
                              transition-colors font-medium"
                  >
                    Buy for {sale.price} ETH
                  </button>
                )}

                {sale.saleType === 'auction' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBidSale(sale);
                      setIsBidModalOpen(true);
                    }}
                    className="w-full mt-4 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 
                              transition-colors font-medium"
                  >
                    {sale.seller.toLowerCase() === address?.toLowerCase() 
                      ? `Accept Highest Bid (${sale.highestBid} ETH)`
                      : `Place Bid (Min: ${sale.minimumBid} ETH)`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSale && (
        <CancelListingModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedSale(null);
          }}
          saleId={selectedSale.saleId}
          tokenId={selectedSale.tokenId}
          nftName={selectedSale.name}
          image={selectedSale.image}
          rarity={selectedSale.rarity}
          saleType={selectedSale.saleType}
          price={selectedSale.price}
        />
      )}

      {selectedBuySale && (
        <BuyModal
          isOpen={isBuyModalOpen}
          onClose={() => {
            setIsBuyModalOpen(false);
            setSelectedBuySale(null);
          }}
          saleId={selectedBuySale.saleId}
          tokenId={selectedBuySale.tokenId}
          nftName={selectedBuySale.name}
          image={selectedBuySale.image}
          rarity={selectedBuySale.rarity}
          price={selectedBuySale.price}
        />
      )}

      {selectedBidSale && (
        <BidModal
          isOpen={isBidModalOpen}
          onClose={() => {
            setIsBidModalOpen(false);
            setSelectedBidSale(null);
          }}
          saleId={selectedBidSale.saleId}
          tokenId={selectedBidSale.tokenId}
          nftName={selectedBidSale.name}
          image={selectedBidSale.image}
          rarity={selectedBidSale.rarity}
          minimumBid={selectedBidSale.minimumBid || 0}
          currentHighestBid={selectedBidSale.highestBid || 0}
          isSeller={selectedBidSale.seller.toLowerCase() === address?.toLowerCase()}
        />
      )}
    </div>
  );
};

export default TradingMarketplace;
