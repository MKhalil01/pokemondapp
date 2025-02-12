import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import MintingInterface from '../components/MintingInterface';
import NFTGallery from '../components/NFTGallery';
import TradingMarketplace from '../components/TradingMarketplace';
import { useState } from 'react';
import { Sale, SaleType } from '../types/Sale';
import { useAccount } from 'wagmi';

const Home: React.FC = () => {
  const { address } = useAccount();
  const [activeSales, setActiveSales] = useState<Sale[]>([]);

  const handleNewListing = (tokenId: number, price: number, saleType: SaleType) => {
    if (!address) return; // Add check for connected wallet

    // Check if NFT is already listed
    if (activeSales.some(sale => sale.tokenId === tokenId)) {
      alert('This NFT is already listed in the marketplace');
      return;
    }

    // Get the NFT metadata from the metadata files
    fetch(`/metadata_files/metadata_${tokenId}.json`)
      .then(res => res.json())
      .then(data => {
        const attributes = data.attributes.reduce((acc: any, curr: any) => {
          acc[curr.trait_type.toLowerCase()] = curr.value;
          return acc;
        }, {});

        const newSale: Sale = {
          tokenId,
          seller: address, // Use actual connected address
          price,
          saleType,
          name: data.name,
          image: data.image,
          rarity: attributes.rarity || 'Common',
          stats: {
            hp: attributes.hp || 50,
            attack: attributes.attack || 50,
            defense: attributes.defense || 50,
            speed: attributes.speed || 50,
            spAttack: attributes['special-attack'] || 50,
            spDefense: attributes['special-defense'] || 50,
          },
          ...(saleType === 'auction' && {
            minimumBid: price,
            highestBid: 0,
            highestBidder: undefined,
            endTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
          }),
        };

        setActiveSales(prev => [...prev, newSale]);
      })
      .catch(error => {
        console.error('Error creating new sale:', error);
      });
  };

  const handleCancelSale = (tokenId: number) => {
    // Remove the sale from activeSales
    setActiveSales(prev => prev.filter(sale => sale.tokenId !== tokenId));
  };

  const handlePlaceBid = (tokenId: number, bidAmount: number) => {
    setActiveSales(prev => prev.map(sale => {
      if (sale.tokenId === tokenId) {
        return {
          ...sale,
          highestBid: bidAmount,
          highestBidder: address,
        };
      }
      return sale;
    }));
  };

  return (
    <>
      <Head>
        <title>Pokemon NFT dApp</title>
        <meta name="description" content="Mint and trade Pokemon NFTs" />
      </Head>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <MintingInterface />
          <NFTGallery onCreateListing={handleNewListing} />
          <TradingMarketplace 
            activeSales={activeSales} 
            onCancelSale={handleCancelSale}
            onPlaceBid={handlePlaceBid}
          />
        </main>
      </div>
    </>
  );
};

export default Home;
