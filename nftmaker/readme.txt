nftmaker.py is a script that iterates through the pokedex api and generates nft metadata for each pokemon.

In order to establish rarity, the script uses the base experience of each pokemon.

The script saves the metadata to a json file for each pokemon.

Common: base_experience < 100
Uncommon: 100 <= base_experience < 200
Rare: 200 <= base_experience < 300
Legendary: base_experience >= 300

^ random can probs optimise this


1025 pokemon


Will upload the metadata to ipfs and then mint the nfts on eth testnet.