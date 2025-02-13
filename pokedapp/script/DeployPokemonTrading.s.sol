// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PokemonTrading} from "../src/PokemonTrading.sol";

contract DeployPokemonTrading is Script {
    function setUp() public {}

    function run() public {
        // Load private key from .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Load NFT contract address 
        address nftAddress = address(0xf4F833c8649F913e251Bdec113bEFED33889e3d1);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PokemonTrading contract
        PokemonTrading pokemonTrading = new PokemonTrading(nftAddress);

        console.log("PokemonTrading deployed at:", address(pokemonTrading));

        vm.stopBroadcast();
    }
} 