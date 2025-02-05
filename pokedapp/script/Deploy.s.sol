// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script} from "forge-std/Script.sol";
import {PokemonNFT} from "../src/PokemonNFT.sol";

contract DeployPokemonNFT is Script {
    function run() external {
        vm.startBroadcast();
        new PokemonNFT();
        vm.stopBroadcast();
    }
}