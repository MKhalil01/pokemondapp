// components/NFTGallery.tsx
import React, { useEffect, useState } from 'react';
import PokemonCard, { NFTData } from './PokemonCard';

const dummyNFTs: NFTData[] = [
  {
    tokenId: 1,
    name: 'Pikachu',
    imageUrl: 'https://ipfs.io/ipfs/QmExamplePikachu',
    rarity: 'Rare',
    baseExperience: 112,
    stats: { hp: 35, attack: 55, defense: 40, speed: 90, spAttack: 50, spDefense: 50 },
    types: ['Electric'],
  },
  {
    tokenId: 2,
    name: 'Charmander',
    imageUrl: 'https://ipfs.io/ipfs/QmExampleCharmander',
    rarity: 'Common',
    baseExperience: 62,
    stats: { hp: 39, attack: 52, defense: 43, speed: 65, spAttack: 60, spDefense: 50 },
    types: ['Fire'],
  },
  // … Here we need to link to the metadata of the NFTs that the user has minted, save this for later
];

const NFTGallery: React.FC = () => {
  const [nfts, setNFTs] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching NFT data from the blockchain/contract.
    setTimeout(() => {
      setNFTs(dummyNFTs);
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="animate-pulse bg-gray-300 h-64 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-black">Your Pokemon NFTs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <PokemonCard key={nft.tokenId} nft={nft} />
        ))}
      </div>
    </section>
  );
};

export default NFTGallery;
