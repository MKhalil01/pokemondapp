// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
// import {PokemonNFT} from "../src/PokemonNFT.sol";
import {PokemonTrading} from "../src/PokemonTrading.sol";
// import {MockVRFCoordinator} from "../src/MockVRFCoordinator.sol";

contract PokemonTradingScript is Script {
    // PokemonNFT public pokemonNFT;
    PokemonTrading public pokemonTrading;
    // MockVRFCoordinator public mockVRFCoordinator;

    function setUp() public {}

    function run() public {
        // Load private key directly from .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy contracts
        // mockVRFCoordinator = new MockVRFCoordinator();
        // pokemonNFT = new PokemonNFT(address(mockVRFCoordinator));
        pokemonTrading = new PokemonTrading(address(0xf4F833c8649F913e251Bdec113bEFED33889e3d1));

        // Set the base URI for the NFT metadata
        // pokemonNFT.setBaseURI("https://mkhalil01.github.io/pokemondapp/metadata_files/metadata_");

        console.log("Contracts deployed:");
        // console.log("MockVRFCoordinator:", address(mockVRFCoordinator));
        // console.log("PokemonNFT:", address(pokemonNFT));
        console.log("PokemonTrading:", address(pokemonTrading));


        vm.stopBroadcast();
    }
}
