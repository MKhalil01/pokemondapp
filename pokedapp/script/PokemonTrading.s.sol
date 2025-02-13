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
        // Load private key directly from .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy contracts
        mockVRFCoordinator = new MockVRFCoordinator();
        pokemonNFT = new PokemonNFT(address(mockVRFCoordinator));
        pokemonTrading = new PokemonTrading(address(pokemonNFT));

        // Set the base URI for the NFT metadata
        pokemonNFT.setBaseURI("http://localhost:3000/metadata_files/metadata_");

        console.log("Contracts deployed:");
        console.log("MockVRFCoordinator:", address(mockVRFCoordinator));
        console.log("PokemonNFT:", address(pokemonNFT));
        console.log("PokemonTrading:", address(pokemonTrading));


        vm.stopBroadcast();
    }
}
