// components/NFTGallery.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useAccount, useContractRead, usePublicClient, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { readContract } from '@wagmi/core';
import PokemonNFTAbi from '../abis/PokemonNFT.json';
import Image from 'next/image';
import ListNFTModal from './ListNFTModal';
import { SaleType } from '../types/Sale';
import { parseEther } from 'viem';
import PokemonTradingAbi from '../abis/PokemonTrading.json';

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

interface NFTGalleryProps {
  onCreateListing: (tokenId: number, price: number, saleType: SaleType) => void;
}

const CONTRACT_ADDRESS = '0xf4F833c8649F913e251Bdec113bEFED33889e3d1';
const TRADING_CONTRACT_ADDRESS = '0xeD370F9777eAA47317e90803a6A3c0Ea540B0cE3';

const NFTGallery: React.FC<NFTGalleryProps> = ({ onCreateListing }) => {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const publicClient = usePublicClient();
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedSaleType, setSelectedSaleType] = useState<SaleType | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add refs for immediate access
  const tokenIdRef = useRef<number | null>(null);
  const priceRef = useRef<number | null>(null);
  const saleTypeRef = useRef<SaleType | null>(null);

  // Read balance of user's NFTs
  const { data: balance } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: PokemonNFTAbi,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
    enabled: !!address,
  });

  // Update the prepare approval hook
  const { config: approveConfig, error: prepareApprovalError, isError: isPrepareError } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: PokemonNFTAbi,
    functionName: 'approve',
    args: tokenIdRef.current ? [
      TRADING_CONTRACT_ADDRESS,
      BigInt(tokenIdRef.current)
    ] : undefined,
    enabled: !!tokenIdRef.current,
  });

  // Update the write hook with more debugging
  const { 
    write: approve,
    isLoading: isApprovalLoading,
    isSuccess: isApprovalSuccess,
    error: approvalError,
    data: approvalData,
    isError: isWriteError,
    status: writeStatus,
  } = useContractWrite(approveConfig);

  // Add more detailed logging
  useEffect(() => {
    console.log('Write hook state:', {
      hasWrite: !!approve,
      isLoading: isApprovalLoading,
      isSuccess: isApprovalSuccess,
      writeStatus,
      isWriteError,
      approvalError: approvalError?.message,
    });
  }, [approve, isApprovalLoading, isApprovalSuccess, writeStatus, isWriteError, approvalError]);

  // Wait for approval transaction
  const { isSuccess: isApprovalConfirmed } = useWaitForTransaction({
    hash: approvalData?.hash,
  });

  // Prepare listing transaction
  const { config: listConfig, error: prepareListingError } = usePrepareContractWrite({
    address: TRADING_CONTRACT_ADDRESS,
    abi: PokemonTradingAbi,
    functionName: selectedSaleType === 'auction' ? 'createAuctionSale' : 'createFixedPriceSale',
    args: selectedTokenId && selectedPrice ? [
      BigInt(selectedTokenId),    // tokenId
      parseEther(selectedPrice.toString()),  // price/startingPrice
    ] : undefined,
    enabled: !!selectedTokenId && !!selectedPrice && !!selectedSaleType && isApprovalConfirmed,
  });

  const { 
    write: listNFT,
    isLoading: isListingLoading,
    error: listingError,
    data: listingData,
  } = useContractWrite(listConfig);

  // Wait for listing transaction
  const { isSuccess: isListingConfirmed } = useWaitForTransaction({
    hash: listingData?.hash,
  });

  // Add debug logging for prepare hook
  console.log('Prepare approval config:', {
    selectedTokenId,
    tradingContract: TRADING_CONTRACT_ADDRESS,
    prepareError: prepareApprovalError?.message,
    hasConfig: !!approveConfig,
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

  const handleListNFT = async (tokenId: number, price: number, saleType: SaleType) => {
    try {
      console.log('Starting listing process...', { tokenId, price, saleType });
      
      // Update refs immediately
      tokenIdRef.current = tokenId;
      priceRef.current = price;
      saleTypeRef.current = saleType;

      // Update state
      setError(null);
      setSelectedTokenId(tokenId);
      setSelectedPrice(price);
      setSelectedSaleType(saleType);

      // Wait for prepare hooks to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Now check if approve is available
      if (!approve) {
        console.error('Approve function preparation state:', {
          hasConfig: !!approveConfig,
          isPrepareError,
          prepareError: prepareApprovalError?.message,
          selectedTokenId: tokenIdRef.current,
          args: tokenIdRef.current ? [TRADING_CONTRACT_ADDRESS, BigInt(tokenIdRef.current)] : undefined
        });
        throw new Error('Failed to prepare approval transaction. Please try again.');
      }

      // Start approval
      setIsApproving(true);
      console.log('Sending approval transaction...');
      const approveTx = await approve();
      console.log('Approval transaction sent:', approveTx);

      // Wait for approval confirmation
      console.log('Waiting for approval confirmation...');
      const approvalConfirmed = await new Promise((resolve) => {
        const checkApproval = async () => {
          try {
            // Wait a bit for the transaction to be mined
            if (!approveTx.hash) {
              return;
            }

            const approvalEvents = await publicClient.getContractEvents({
              address: CONTRACT_ADDRESS,
              abi: PokemonNFTAbi,
              eventName: 'Approval',
              args: {
                owner: address,
                approved: TRADING_CONTRACT_ADDRESS,
                tokenId: BigInt(selectedTokenId!)
              },
              // Use fromBlock: 'latest' instead of trying to access blockNumber
              fromBlock: 'latest'
            });

            if (approvalEvents.length > 0) {
              console.log('Found approval event:', approvalEvents[0]);
              resolve(true);
              return;
            }
          } catch (error) {
            console.error('Error checking approval:', error);
          }
        };

        // Check every second
        const interval = setInterval(checkApproval, 1000);

        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(interval);
          resolve(false);
        }, 60000);

        // Initial check
        checkApproval();
      });

      if (!approvalConfirmed) {
        throw new Error('Approval transaction timed out. Please check your wallet.');
      }

      // Wait for listing preparation
      await new Promise(resolve => {
        const checkListPrepare = setInterval(() => {
          if (listNFT) {
            clearInterval(checkListPrepare);
            resolve(true);
          }
        }, 100);
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkListPrepare);
          resolve(false);
        }, 5000);
      });

      if (!listNFT) {
        throw new Error('Failed to prepare listing transaction. Please try again.');
      }

      // Start listing
      setIsListing(true);
      console.log('Starting listing...', {
        tokenId,
        price,
        saleType,
        listNFT: !!listNFT
      });

      const listTx = await listNFT();
      console.log('Listing submitted:', listTx);

      // Wait for listing confirmation
      console.log('Waiting for listing confirmation...');
      const listingConfirmed = await new Promise((resolve) => {
        const checkListing = setInterval(() => {
          if (isListingConfirmed) {
            clearInterval(checkListing);
            resolve(true);
          }
        }, 1000);
        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(checkListing);
          resolve(false);
        }, 60000);
      });

      if (!listingConfirmed) {
        throw new Error('Listing transaction timed out. Please check your wallet.');
      }

      // If everything succeeded
      setIsListModalOpen(false);
      onCreateListing(tokenId, price, saleType);

    } catch (error) {
      console.error('Error listing NFT:', error);
      setError(error instanceof Error ? error.message : 'Failed to list NFT');
    } finally {
      setIsApproving(false);
      setIsListing(false);
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
        onClose={() => {
          setIsListModalOpen(false);
          setError(null);
        }}
        ownedNFTs={nfts}
        onListNFT={handleListNFT}
        isLoading={isApproving || isListing}
        error={error}
      />
    </div>
  );
};

export default NFTGallery;
