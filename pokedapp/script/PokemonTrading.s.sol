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
        vm.startBroadcast();

        mockVRFCoordinator = new MockVRFCoordinator();
        pokemonNFT = new PokemonNFT(address(mockVRFCoordinator));
        pokemonTrading = new PokemonTrading(address(pokemonNFT));

        console.log("PokemonNFT contract deployed at:", address(pokemonNFT));
        console.log(
            "PokemonTrading contract deployed at:",
            address(pokemonTrading)
        );
        console.log(
            "MockVRFCoordinator contract deployed at:",
            address(mockVRFCoordinator)
        );

        vm.stopBroadcast();
    }
}
