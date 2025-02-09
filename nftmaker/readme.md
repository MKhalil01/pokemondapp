# Pokemon NFT Metadata Generator

## Overview
`nftmaker.py` is a Python script designed to iterate through the PokeAPI and generate NFT metadata for each Pokemon. The script determines the rarity of each Pokemon based on their base experience and saves the metadata to a JSON file.

## Rarity Classification
The rarity of each Pokemon is determined using the following criteria based on their base experience:
- **Common (50%)**: base_experience < 159
- **Uncommon (30%)**: 159 <= base_experience < 248
- **Rare (15%)**: 248 <= base_experience < 301
- **Legendary (5%)**: base_experience >= 301

## Future Plans
The generated metadata will be uploaded to IPFS, and the NFTs will be minted on the Ethereum testnet.

## Usage
To run the script, execute the following command:
```sh
python nftmaker.py
```