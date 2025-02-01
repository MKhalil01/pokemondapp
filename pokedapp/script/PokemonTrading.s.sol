// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PokemonTrading} from "../src/PokemonTrading.sol";

contract PokemonTradingScript is Script {
    PokemonTrading public pokemonTrading;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        pokemonTrading = new PokemonTrading();
        console.log(
            "PokemonTrading contract deployed at:",
            address(pokemonTrading)
        );

        vm.stopBroadcast();
    }
}
