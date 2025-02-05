// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test} from "forge-std/Test.sol";
import {PokemonNFT} from "../src/PokemonNFT.sol";

contract PokemonNFTTest is Test {
    PokemonNFT nft;
    address owner = address(0x123);
    string mockURI = "ipfs://Qm.../1.json";

    function setUp() public {
        vm.prank(owner);
        nft = new PokemonNFT();
    }

    function testMint() public {
        vm.prank(owner);
        nft.mintPokemon(owner, mockURI);
        assertEq(nft.ownerOf(1), owner);
        assertEq(nft.tokenURI(1), mockURI);
    }
}