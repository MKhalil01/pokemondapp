// components/NFTGallery.tsx
import React, { useEffect, useState } from 'react';
import PokemonCard, { NFTData } from './PokemonCard';
import Image from 'next/image';
import ListNFTModal from './ListNFTModal';

const dummyNFTs: NFTData[] = [
  {
    tokenId: 1,
    name: 'Pikachu',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/11.png',
    rarity: 'Rare',
    baseExperience: 112,
    stats: { hp: 35, attack: 55, defense: 40, speed: 90, spAttack: 50, spDefense: 50 },
    types: ['Electric'],
  },
  {
    tokenId: 2,
    name: 'Charmander',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/11.png',
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
  const [error, setError] = useState<string | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        // In the future, this will fetch from the blockchain
        setNFTs(dummyNFTs);
      } catch (err) {
        setError('Failed to load NFTs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  const handleListNFT = async (tokenId: number, price: number) => {
    try {
      // TODO: Implement the actual listing logic with smart contract
      console.log(`Listing NFT ${tokenId} for ${price} ETH`);
      // After successful listing, you might want to refresh the NFTs
      await fetchNFTs();
    } catch (error) {
      console.error('Error listing NFT:', error);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

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
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My owned pokemon</h1>
        <button
          onClick={() => setIsListModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          List NFT
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
        {nfts.map((nft) => (
          <PokemonCard key={nft.tokenId} nft={nft} />
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
