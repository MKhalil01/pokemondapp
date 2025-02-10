// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {console} from "forge-std/Test.sol";
// import {VRFCoordinatorV2Interface} from "chainlink-brownie-contracts/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "chainlink-brownie-contracts/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract MockVRFCoordinator {
    VRFConsumerBaseV2 public consumer;
    uint256 public requestId;

    constructor(address _consumer) {
        consumer = VRFConsumerBaseV2(_consumer);
    }

    function requestRandomWords(
        // bytes32 keyHash,
        // uint64 subId,
        // uint16 minReqConfs,
        // uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256[] memory) {
        uint256[] memory randomWords = new uint256[](numWords);
        for (uint256 i = 0; i < numWords; i++) {
            randomWords[i] = requestId + i;
        }
        consumer.rawFulfillRandomWords(requestId, randomWords);
        requestId += numWords;
        return randomWords;
    }

    // function fulfillRandomWords(
    //     uint256 _requestId,
    //     uint256[] memory randomWords
    // ) external pure {
    //     // consumer.rawFulfillRandomWords(_requestId, randomWords);
    //     for (uint256 i = 0; i < randomWords.length; i++) {
    //         console.log("Random Wordzz", i, ":", randomWords[i]);
    //     }
    //     console.log("Request ID:", _requestId);
    // }

    // Other required functions from VRFCoordinatorV2Interface can be added here as needed
}
