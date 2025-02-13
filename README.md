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
   git clone [repository-url]
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

### External APIs

- Pokemon data is fetched from [PokeAPI](https://pokeapi.co/)

## Architecture Overview

[Coming soon]
- Smart Contract Architecture
- Frontend Architecture
- Data Flow
- Integration Points

## Security Considerations

[Coming soon]
- Smart Contract Security
- Access Control
- Data Privacy
- Known Limitations