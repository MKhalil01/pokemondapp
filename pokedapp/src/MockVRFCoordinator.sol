// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {VRFConsumerBaseV2} from "chainlink-brownie-contracts/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract MockVRFCoordinator {
    VRFConsumerBaseV2 public consumer;

    function requestRandomWords(
        uint256 requestId,
        uint32 numWords
    ) external view returns (uint256[] memory) {
        uint256[] memory randomWords = new uint256[](numWords);
        for (uint256 i = 0; i < numWords; i++) {
            randomWords[i] = uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        requestId,
                        i
                    )
                )
            );
        }
        return randomWords;
    }
}
