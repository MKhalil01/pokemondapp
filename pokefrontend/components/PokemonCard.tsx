// components/PokemonCard.tsx
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

const PokemonCard: React.FC<PokemonCardProps> = ({ nft }) => {
  const [flipped, setFlipped] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  return (
    <div
      className="relative w-full h-80 cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      // Note: For proper 3D flip effects, ensure your global CSS sets:
      // .perspective { perspective: 1000px; }
      // .backface-hidden { backface-visibility: hidden; }
    >
      <motion.div
        className="absolute w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Front side: NFT image with rarity badge */}
        <div className="absolute w-full h-full backface-hidden bg-white border rounded-lg shadow-lg overflow-hidden">
          {!imageLoaded && (
            <div className="animate-pulse w-full h-full bg-gray-200"></div>
          )}
          <img
            src={nft.imageUrl}
            alt={nft.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover ${!imageLoaded ? 'hidden' : ''}`}
          />
          <div className="absolute top-2 left-2">
            <span className={`text-xs px-2 py-1 rounded ${rarityColors[nft.rarity]}`}>
              {nft.rarity}
            </span>
          </div>
        </div>
        {/* Back side: Metadata (name, radar chart, base experience meter, and type badges) */}
        <div className="absolute w-full h-full backface-hidden bg-white border rounded-lg shadow-lg overflow-hidden rotateY-180 p-4">
          <h3 className="text-lg font-bold mb-2">{nft.name}</h3>
          <div className="mb-2">
            <RadarChart stats={nft.stats} />
          </div>
          <div className="mb-2">
            <p className="text-sm">Base Experience:</p>
            <div className="w-full bg-gray-300 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-yellow-500"
                style={{ width: `${Math.min(nft.baseExperience, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="flex space-x-2">
            {nft.types.map((type) => (
              <span key={type} className={`text-xs px-2 py-1 rounded ${typeColors[type] || 'bg-gray-400'}`}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PokemonCard;
