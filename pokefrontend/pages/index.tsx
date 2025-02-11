import type { NextPage } from 'next';
import Head from 'next/head';
import Header from '../components/Header';
import MintingInterface from '../components/MintingInterface';
import NFTGallery from '../components/NFTGallery';
import TradingMarketplace from '../components/TradingMarketplace';

const Home: NextPage = () => {
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
          <NFTGallery />
          <TradingMarketplace />
        </main>
      </div>
    </>
  );
};

export default Home;
