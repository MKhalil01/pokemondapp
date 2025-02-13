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

[Rest of Architecture sections coming soon]

## Security Considerations

[Coming soon]
- Smart Contract Security
- Access Control
- Data Privacy
- Known Limitations