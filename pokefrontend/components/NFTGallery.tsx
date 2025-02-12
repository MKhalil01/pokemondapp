// components/NFTGallery.tsx
import React, { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import PokemonNFTAbi from '../abis/PokemonNFT.json';
import Image from 'next/image';
import ListNFTModal from './ListNFTModal';

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
}

interface NFTMetadata {
  name: string;
  image: string;
  rarity: string;
  stats: PokemonStats;
  tokenId: number;
}

const MAX_STATS = {
  hp: 255,
  attack: 181,
  defense: 230,
  spAttack: 173,
  spDefense: 230,
  speed: 200
};

const StatBar: React.FC<{ value: number; maxValue: number; label: string }> = ({ value, maxValue, label }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-sm text-gray-600">{label}: {value}</div>
      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full ${
            percentage > 80 ? 'bg-green-500' :
            percentage > 50 ? 'bg-blue-500' :
            percentage > 30 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const getCardStyle = (rarity: string) => {
  switch (rarity.toLowerCase()) {
    case 'legendary':
      return 'bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-100 shadow-lg border border-amber-300';
    case 'rare':
      return 'bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 shadow-md border border-indigo-200';
    case 'uncommon':
      return 'bg-gradient-to-br from-emerald-50 to-green-50 border border-green-100';
    default: // Common
      return 'bg-white border border-gray-100';
  }
};

const NFTGallery: React.FC = () => {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  // Hardcoded Pokemon IDs for testing
  const testPokemonIds = [10, 949, 567, 4321, 10200, 10071, 7542];

  // Fetch token IDs and metadata
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const tokenPromises = testPokemonIds.map(async id => {
          console.log(`Attempting to fetch metadata for Pokemon #${id}`);
          try {
            const response = await fetch(`/metadata_files/metadata_${id}.json`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Successfully fetched metadata for Pokemon #${id}`, data);

            // Transform the attribute array into our expected format
            const attributes = data.attributes.reduce((acc: any, curr: any) => {
              acc[curr.trait_type.toLowerCase()] = curr.value;
              return acc;
            }, {});

            return {
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
              tokenId: id,
            };
          } catch (error) {
            console.error(`Failed to fetch metadata for Pokemon #${id}:`, error);
            return {
              name: `Pokemon #${id}`,
              image: '/placeholder-pokemon.png',
              rarity: 'Common',
              stats: {
                hp: 50,
                attack: 50,
                defense: 50,
                speed: 50,
                spAttack: 50,
                spDefense: 50,
              },
              tokenId: id,
            };
          }
        });

        const metadata = await Promise.all(tokenPromises);
        setNfts(metadata);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []); // Remove address and balance dependencies since we're using hardcoded IDs

  const handleListNFT = async (tokenId: number, price: number) => {
    try {
      console.log(`Listing NFT ${tokenId} for ${price} ETH`);
    } catch (error) {
      console.error('Error listing NFT:', error);
    }
  };

  const getRarityStyle = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 text-white font-bold animate-pulse shadow-lg shadow-amber-200';
      case 'rare':
        return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md';
      case 'uncommon':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
      default: // Common
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        Please connect your wallet to view your NFTs
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        Loading your Pokemon NFTs...
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        You don't own any Pokemon NFTs yet
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Pokemon Collection</h1>
        <button
          onClick={() => setIsListModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          List NFT
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <div 
            key={nft.tokenId}
            className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow 
              ${getCardStyle(nft.rarity)}`}
          >
            <img 
              src={nft.image} 
              alt={nft.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{nft.name}</h3>
                <span className={`px-3 py-1 text-xs rounded-full ${getRarityStyle(nft.rarity)} 
                  transition-all duration-300 hover:scale-105`}>
                  {nft.rarity}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                <StatBar value={nft.stats.hp} maxValue={MAX_STATS.hp} label="HP" />
                <StatBar value={nft.stats.attack} maxValue={MAX_STATS.attack} label="ATK" />
                <StatBar value={nft.stats.defense} maxValue={MAX_STATS.defense} label="DEF" />
                <StatBar value={nft.stats.speed} maxValue={MAX_STATS.speed} label="SPD" />
                <StatBar value={nft.stats.spAttack} maxValue={MAX_STATS.spAttack} label="SP.A" />
                <StatBar value={nft.stats.spDefense} maxValue={MAX_STATS.spDefense} label="SP.D" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ListNFTModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        ownedNFTs={nfts}
        onListNFT={handleListNFT}
      />
    </div>
  );
};

export default NFTGallery;
