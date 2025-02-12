import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RadarChart from './RadarChart';

export interface NFTData {
  tokenId: number;
  name: string;
  imageUrl: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  baseExperience: number;
  stats: { [key: string]: number };
  types: string[];
  isOwned?: boolean;
}

const rarityColors: Record<string, string> = {
  Common: 'bg-gray-300',
  Uncommon: 'bg-green-400',
  Rare: 'bg-blue-400',
  Legendary: 'bg-purple-600',
};

const typeColors: Record<string, string> = {
  Electric: 'bg-yellow-400',
  Fire: 'bg-red-400',
  Water: 'bg-blue-400',
  Grass: 'bg-green-400',
  // … add other types as needed.
};

interface PokemonCardProps {
  nft: NFTData;
}

const PokemonCard = ({ nft }: PokemonCardProps) => {
  const [showRadar, setShowRadar] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const toggleView = () => {
    setShowRadar(!showRadar);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-[320px] h-[420px] flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">{nft.name}</h2>
        <button 
          onClick={toggleView}
          className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {showRadar ? 'Show Image' : 'Show Stats'}
        </button>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full aspect-square relative">
          {showRadar ? (
            <RadarChart stats={nft.stats} />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className={`w-full h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="w-full mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">Base Experience:</span>
            <div className="flex-grow h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-yellow-400 rounded-full" 
                style={{ width: `${(nft.baseExperience / 255) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-start">
            <span className={`px-3 py-1 rounded-full text-sm ${
              nft.types[0] === 'Electric' ? 'bg-yellow-400' : 
              nft.types[0] === 'Fire' ? 'bg-red-500 text-white' :
              'bg-gray-200'
            }`}>
              {nft.types[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
