// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {PokemonTrading} from "../src/PokemonTrading.sol";
import {PokemonNFT} from "../src/PokemonNFT.sol";
import {MockVRFCoordinator} from "../src/MockVRFCoordinator.sol";

contract PokemonTradingTest is Test {
    PokemonTrading pokemonTrading;
    PokemonNFT pokemonNFT;
    MockVRFCoordinator mockVRFCoordinator;
    address owner = address(0x123);
    // address vrfCoordinator = address(0x456); // Example VRF Coordinator address
    // uint64 subscriptionId = 1; // Example subscription ID
    // bytes32 keyHash = 0x0; // Example key hash

    function setUp() public {
        // Deploy the mock VRF Coordinator
        mockVRFCoordinator = new MockVRFCoordinator(address(this));

        // Deploy the contracts
        pokemonTrading = new PokemonTrading();
        // pokemonNFT = new PokemonNFT(vrfCoordinator, subscriptionId, keyHash);

        // Transfer ownership to the test owner
        pokemonTrading.transferOwnership(owner);
        // pokemonNFT.transferOwnership(owner);
    }

    function rawFulfillRandomWords(
        uint256 _requestId,
        uint256[] memory randomWords
    ) external pure {
        for (uint256 i = 0; i < randomWords.length; i++) {
            console.log("Random Wordzz", i, ":", randomWords[i]);
        }
        console.log("Request ID:", _requestId);
    }

    function testMockVRF() public {
        // Call requestRandomWords and print the output
        uint256[] memory requestId = mockVRFCoordinator.requestRandomWords(
            // 0x0,
            // 1,
            // 2, // minReqConfs
            // 2500000, // callbackGasLimit
            1 // numWords
        );
        for (uint256 i = 0; i < requestId.length; i++) {
            console.log("Random Word", i, ":", requestId[i]);
        }
        requestId = mockVRFCoordinator.requestRandomWords(
            // 0x0,
            // 1,
            // 3, // minReqConfs
            // 2500000, // callbackGasLimit
            1 // numWords
        );
        for (uint256 i = 0; i < requestId.length; i++) {
            console.log("Random Word", i, ":", requestId[i]);
        }
        requestId = mockVRFCoordinator.requestRandomWords(
            // 0x0,
            // 1,
            // 4, // minReqConfs
            // 2500000, // callbackGasLimit
            5 // numWords
        );
        for (uint256 i = 0; i < requestId.length; i++) {
            console.log("Random Word", i, ":", requestId[i]);
        }
        // assert(true);
        // uint256[] memory randomWords = new uint256[](1);
        // randomWords[0] = uint256(keccak256(abi.encodePacked(block.timestamp)));
        // mockVRFCoordinator.fulfillRandomWords(1, randomWords);
    }

    function testOwners() public view {
        // Check that the owners are correct
        assertEq(
            pokemonTrading.owner(),
            owner,
            "PokemonTrading owner is incorrect"
        );
        // assertEq(pokemonNFT.owner(), owner, "PokemonNFT owner is incorrect");
    }

    // function testMintOneNFT() public {
    //     // Set the mint price
    //     uint256 mintPrice = pokemonNFT.mintPrice();
    //     console.log("Mint price:", mintPrice);

    //     // Check the initial total supply
    //     uint256 initialSupply = pokemonNFT.totalSupply();
    //     console.log("Initial total supply:", initialSupply);

    //     // Request to mint one NFT
    //     vm.prank(owner);
    //     // pokemonNFT.requestMint{value: mintPrice}(1);
    //     try pokemonNFT.requestMint{value: mintPrice}(1) {
    //         console.log("Mint request successful");
    //     } catch Error(string memory reason) {
    //         console.log("Mint request failed:", reason);
    //         revert(reason);
    //     } catch (bytes memory lowLevelData) {
    //         console.log("Mint request failed with low-level data");
    //         revert(string(lowLevelData));
    //     }

    //     // Verify that the total supply has increased by 1
    //     assertEq(pokemonNFT.totalSupply(), 1, "Total supply should be 1");

    //     // Verify that the owner of the minted NFT is correct
    //     assertEq(
    //         pokemonNFT.ownerOf(1),
    //         owner,
    //         "Owner of the minted NFT should be the test owner"
    //     );
    // }
}
