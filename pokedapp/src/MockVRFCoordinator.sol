// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

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
    ) external returns (uint256) {
        uint256[] memory randomWords = new uint256[](numWords);
        for (uint256 i = 0; i < numWords; i++) {
            randomWords[i] = requestId + i;
        }
        consumer.rawFulfillRandomWords(requestId, randomWords);
        requestId += numWords;
        return requestId;
    }
}
