// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {PokemonTrading} from "../src/PokemonTrading.sol";
import {PokemonNFT} from "../src/PokemonNFT.sol";
// import {MockVRFCoordinator} from "../src/MockVRFCoordinator.sol";

contract PokemonTradingTest is Test {
    PokemonTrading pokemonTrading;
    PokemonNFT pokemonNFT;
    // MockVRFCoordinator mockVRFCoordinator;
    address addr1 = address(0x123);

    function setUp() public {
        // Fund the owner address with Ether
        vm.deal(addr1, 10 ether);

        // Deploy the contracts
        pokemonTrading = new PokemonTrading();
        pokemonNFT = new PokemonNFT();
        // mockVRFCoordinator = new MockVRFCoordinator(address(pokemonNFT));
    }

    function testOwners() public {
        // Transfer ownership to the test owner
        pokemonTrading.transferOwnership(addr1);
        pokemonNFT.transferOwnership(addr1);

        // Check that the owners are correct
        assertEq(
            pokemonTrading.owner(),
            addr1,
            "PokemonTrading owner is incorrect"
        );
        assertEq(pokemonNFT.owner(), addr1, "PokemonNFT owner is incorrect");
    }

    function testMintOneNFT() public {
        uint256 mintPrice = pokemonNFT.mintPrice();
        uint256 initialSupply = pokemonNFT.totalSupply();

        // Request to mint one NFT
        pokemonNFT.requestMint{value: mintPrice}(1);

        // Verify that the total supply has increased by 1
        assertEq(
            pokemonNFT.totalSupply(),
            initialSupply + 1,
            "Total supply should be 1"
        );
    }

    function testMintTwoNFTs() public {
        uint256 mintPrice = pokemonNFT.mintPrice();
        uint256 initialSupply = pokemonNFT.totalSupply();

        // Request to mint two NFTs
        pokemonNFT.requestMint{value: 2 * mintPrice}(2);

        // Verify that the total supply has increased by 2
        assertEq(
            pokemonNFT.totalSupply(),
            initialSupply + 2,
            "Total supply should be 2"
        );
    }

    function testMintManyNFTs() public {
        uint256 mintPrice = pokemonNFT.mintPrice();
        uint256 initialSupply = pokemonNFT.totalSupply();

        // Request to mint one thousand NFTs
        pokemonNFT.requestMint{value: 1000 * mintPrice}(1000);

        // Verify that the total supply has increased by 1000
        assertEq(
            pokemonNFT.totalSupply(),
            initialSupply + 1000,
            "Total supply should be 1000"
        );
    }
}
