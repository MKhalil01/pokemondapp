// components/NFTGallery.tsx
import React, { useEffect, useState } from 'react';
import {
  useAccount,
  useContractRead,
  usePublicClient,
} from 'wagmi';
import { readContract } from '@wagmi/core';
import PokemonNFTAbi from '../abis/PokemonNFT.json';
import ListingModal from './ListingModal';


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

const CONTRACT_ADDRESS = '0xf4F833c8649F913e251Bdec113bEFED33889e3d1';

const NFTGallery: React.FC = () => {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient();
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  // Read balance of user's NFTs
  const { data: balance } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: PokemonNFTAbi,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
    enabled: Boolean(address),
  });

  // Fetch token IDs and metadata
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address || !balance) {
        setLoading(false);
        return;
      }

      try {
        // Get all Transfer events to and from the address
        const transferEvents = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: PokemonNFTAbi,
          eventName: 'Transfer',
          fromBlock: 0n
        });

        // Create a map to track the current owner of each token
        const tokenOwnership = new Map<number, string>();

        // Process events in chronological order to track current ownership
        transferEvents.forEach(event => {
          const tokenId = Number(event.args.tokenId);
          const to = event.args.to.toLowerCase();
          tokenOwnership.set(tokenId, to);
        });

        // Filter for tokens currently owned by the address
        const ownedTokenIds = Array.from(tokenOwnership.entries())
          .filter(([_, owner]) => owner === address.toLowerCase())
          .map(([tokenId]) => tokenId);

        // Fetch metadata for owned tokens
        const metadataPromises = ownedTokenIds.map(async (tokenId) => {
          const uri = await readContract({
            address: CONTRACT_ADDRESS,
            abi: PokemonNFTAbi,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          });

          const response = await fetch(uri as string);
          const metadata = await response.json();

          // Helper function to get attribute value
          const getAttributeValue = (attributes: any[], traitType: string, defaultValue: number | string) => {
            const attr = attributes.find(a => a.trait_type.toLowerCase() === traitType.toLowerCase());
            return attr ? attr.value : defaultValue;
          };

          return {
            tokenId,
            name: metadata.name,
            image: metadata.image,
            rarity: getAttributeValue(metadata.attributes, 'rarity', 'Common'),
            stats: {
              hp: getAttributeValue(metadata.attributes, 'hp', 50),
              attack: getAttributeValue(metadata.attributes, 'attack', 50),
              defense: getAttributeValue(metadata.attributes, 'defense', 50),
              speed: getAttributeValue(metadata.attributes, 'speed', 50),
              spAttack: getAttributeValue(metadata.attributes, 'special-attack', 50),
              spDefense: getAttributeValue(metadata.attributes, 'special-defense', 50),
            },
          };
        });

        const nftMetadata = await Promise.all(metadataPromises);
        setNfts(nftMetadata);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address, balance, publicClient]);

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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <div 
          key={nft.tokenId}
          className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer
            ${getCardStyle(nft.rarity)}`}
          onClick={() => {
            setSelectedNFT(nft);
            setIsListingModalOpen(true);
          }}
        >
          <img 
            src={nft.image} 
            alt={nft.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{nft.name}</h3>
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

      {selectedNFT && (
  <ListingModal
    isOpen={isListingModalOpen}
    onClose={() => {
      setIsListingModalOpen(false);
      setSelectedNFT(null);
    }}
    tokenId={selectedNFT.tokenId}
    nftName={selectedNFT.name}
    image={selectedNFT.image}
    rarity={selectedNFT.rarity}
  />
)}
    </div>
  );
};

export default NFTGallery;
