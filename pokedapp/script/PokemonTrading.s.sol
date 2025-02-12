// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PokemonNFT} from "../src/PokemonNFT.sol";
import {PokemonTrading} from "../src/PokemonTrading.sol";
import {MockVRFCoordinator} from "../src/MockVRFCoordinator.sol";

contract PokemonTradingScript is Script {
    PokemonNFT public pokemonNFT;
    PokemonTrading public pokemonTrading;
    MockVRFCoordinator public mockVRFCoordinator;

    function setUp() public {}

    function run() public {
        // First deploy contracts as the default sender
        vm.startBroadcast();

        mockVRFCoordinator = new MockVRFCoordinator();
        pokemonNFT = new PokemonNFT(address(mockVRFCoordinator));
        pokemonTrading = new PokemonTrading(address(pokemonNFT));

        console.log("PokemonNFT contract deployed at:", address(pokemonNFT));
        console.log("PokemonTrading contract deployed at:", address(pokemonTrading));
        console.log("MockVRFCoordinator contract deployed at:", address(mockVRFCoordinator));

        vm.stopBroadcast();

        address minter = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        uint256 privateKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
        
        // Log pre-mint states
        uint256 preMintBalance = pokemonNFT.balanceOf(minter);
        uint256 preEthBalance = minter.balance;
        console.log("Pre-mint NFT balance:", preMintBalance);
        console.log("Pre-mint ETH balance:", preEthBalance);

        vm.broadcast(privateKey);
        pokemonNFT.requestMint{value: 0.08 ether}(1);

        // Log post-mint states
        uint256 postMintBalance = pokemonNFT.balanceOf(minter);
        uint256 postEthBalance = minter.balance;
        console.log("Post-mint NFT balance:", postMintBalance);
        console.log("Post-mint ETH balance:", postEthBalance);
        
        // Verify NFT balance increased
        require(postMintBalance > preMintBalance, "Mint failed - NFT balance not increased");
        
        // Verify ETH balance decreased by mint price (0.08 ETH)
        require(preEthBalance - postEthBalance == 0.08 ether, "Mint failed - incorrect ETH spent");
        
        console.log("Mint successful!");
        console.log("NFTs owned by minter:", postMintBalance);
        console.log("ETH spent:", preEthBalance - postEthBalance);
    }
}
