// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PokemonNFT is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Token ID to metadata URI (stored on IPFS)
    mapping(uint256 => string) private _tokenURIs;
    uint256 public nextTokenId = 1; // Auto-incrementing ID

    constructor() ERC721("PokemonCards", "POKE") Ownable(msg.sender) {}

    // Mint a new Pokémon NFT (only owner initially)
    function mintPokemon(
        address to,
        string memory tokenURI_
    ) external onlyOwner nonReentrant {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = tokenURI_;
        nextTokenId++;
    }

    // Get metadata URI for a tokenId
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist");
        return _tokenURIs[tokenId];
    }
}