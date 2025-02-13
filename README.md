# DeFi Pokemon dApp
By: Mohammed + Preston

## Setup

### Prerequisites

1. **Rust Installation**
   ```sh
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup update stable
   ```

2. **Foundry Installation**
   ```sh
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **Required Dependencies**
   ```sh
   # Install OpenZeppelin contracts
   forge install Openzeppelin/openzeppelin-contracts

   # Install Chainlink contracts
   forge install smartcontractkit/chainlink-brownie-contracts --no-commit

   # Install ERC721A
   forge install chiru-labs/ERC721A
   ```

### Local Development

1. Clone the repository
   ```sh
   git clone https://github.com/MKhalil01/pokemondapp
   cd pokemondapp
   ```

2. Install frontend dependencies
   ```sh
   cd pokefrontend
   npm install
   ```

3. Set up environment variables
   - Create a `.env.local` file in the `pokefrontend` directory
   - Add necessary environment variables (see `.env.example`)

4. Start the development server
   ```sh
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture Overview

### NFT Metadata Generation
The `nftmaker` component is a Python-based metadata generator for Pokemon NFTs that:
- Interacts with [PokeAPI](https://pokeapi.co/) to fetch Pokemon data
- Implements a rarity system based on Pokemon base experience:
  - **Common (50%)**: base_experience < 159
  - **Uncommon (30%)**: 159 ≤ base_experience < 248
  - **Rare (15%)**: 248 ≤ base_experience < 301
  - **Legendary (5%)**: base_experience ≥ 301
- Generates standardized NFT metadata for each Pokemon

#### Metadata File Structure
The generated metadata files can be found in `docs/metadata_files/` with the following format:
- File naming: `metadata_{pokemon_id}{copy_number}.json`
  - Each Pokemon has 10 copies (numbered 0-9)
  - Example: `metadata_9876.json` represents Pokemon #987, copy #6
- Each file contains:
  - Basic info: name, description, copy number
  - Pokemon image URL from official artwork
  - Attributes:
    - Base stats (HP, Attack, Defense, etc.)
    - Base Experience
    - Rarity classification

### Smart Contract Architecture

The smart contracts, located in the `pokedapp` directory, are built and tested using Foundry, providing a robust foundation for the NFT and trading functionality.

The project consists of two main smart contracts:

1. **PokemonNFT Contract** (`src/PokemonNFT.sol`)
   - Built on ERC721A instead of ERC721 for gas optimization:
     - Significantly reduces gas costs when minting multiple NFTs in one transaction
   - Features:
     - Random minting using Chainlink VRF (simulated in testing via MockVRFCoordinator (`src/MockVRFCoordinator.sol`))
     - Maximum supply of 10,250 tokens (1,025 Pokemon × 10 copies each)
     - Fixed mint price of 0.08 ETH per token
     - Spot minting instead of sequential minting

2. **PokemonTrading Contract** (`src/PokemonTrading.sol`)
   - Marketplace for trading Pokemon NFTs
   - Supports two types of sales:
     - Fixed Price: Direct purchase at seller's specified price
     - Auction: 24-hour auctions with bidding system and seller-specified minimum price
   - Features:
     - Bid refunds for outbid auction participants
     - Sale cancellation mechanism
     - Auction expiration handling

#### Deployment Script
The `script/PokemonTrading.s.sol` handles contract deployment and initialization:
- Deploys MockVRFCoordinator, PokemonNFT, and PokemonTrading contracts
- Sets up the NFT metadata base URI

#### Testing File
The `test/PokemonTrading.t.sol` provides comprehensive coverage of core functionality and security measures. Further details can be found in the Security Considerations section below.

### Frontend Architecture

The frontend application, located in the `pokefrontend` directory, is built using Next.js and integrates with the Ethereum blockchain through Web3 libraries.

The architecture follows a component-based structure:

#### Core Components
- **Wallet Integration**: Ethereum wallet connection and transaction management
- **NFT Display**: Visualization of Pokemon NFTs with their attributes and rarity
- **Trading Marketplace**: Central hub for NFT trading activities
- **Bidding System**: Interface for auction participation and management

[Detailed component breakdown coming soon]

## Security Considerations

### Testing Strategy
The project includes extensive test coverage through a comprehensive test suite (`pokedapp/test/PokemonTrading.t.sol`). The tests can be executed using Forge's testing framework:

```sh
forge test
```

The test suite provides thorough coverage of:
- NFT minting functionality and supply management
- Fixed price sale operations and payment handling
- Auction mechanics including bidding, refunds, and timing
- Sale cancellations and state management
- Emergency scenarios and system recovery
- Access control and permission boundaries
- Edge cases and error conditions

Each component is tested in isolation and in integration with other parts of the system, ensuring robust functionality and security. The tests simulate various user interactions and market conditions to validate system behavior under different scenarios.

### Reentrancy Protection
- ReentrancyGuard modifier from OpenZeppelin used on all external functions that handle ETH
- State changes performed before external calls

### Access Control
- Ownable pattern implemented for administrative functions
- Function modifiers restrict access:
  - `onlyOwner` for administrative actions
  - `onlySeller` for sale management
  - `saleExists` for sale interactions
- Clear separation between user and admin capabilities
- No privileged roles beyond contract owner

### Integer Safety
- Automatic overflow/underflow checks in Solidity >=0.8.0
- Additional SafeMath operations through OpenZeppelin's Math library
- Explicit checks for:
  - Maximum supply limits
  - Payment amounts
  - Auction bid values

### Event Emission
Strategic event logging for critical operations:
- `MintRequested` and `MintCompleted` for NFT minting
- `SaleCreated`, `SaleCancelled`, `SaleCompleted` for marketplace activities
- `NewBid` for auction updates
- Enables efficient off-chain tracking and frontend synchronization

### Emergency Controls
- `emergencyStop()` function allows owner to:
  - Halt all trading activities
  - Cancel active sales
  - Refund pending bids
  - Return NFTs to sellers
- Can only be triggered by contract owner
- Protects users in case of critical vulnerabilities
