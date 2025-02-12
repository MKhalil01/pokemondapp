// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ERC721A} from "lib/ERC721A/contracts/ERC721A.sol";
// import {MockVRFCoordinator} from "./MockVRFCoordinator.sol";
// import {VRFCoordinatorV2Interface} from "chainlink-brownie-contracts/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
// import {VRFConsumerBaseV2} from "chainlink-brownie-contracts/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

// contract PokemonNFT is ERC721A, VRFConsumerBaseV2, Ownable {
contract PokemonNFT is ERC721A, Ownable {
    using Strings for uint256;

    // Chainlink VRF Variables
    // VRFCoordinatorV2Interface COORDINATOR;
    // MockVRFCoordinator mockVRFCoordinator;
    // uint64 s_subscriptionId;
    // bytes32 keyHash;
    // uint32 callbackGasLimit = 2500000;
    // uint16 requestConfirmations = 3;
    // uint32 numWords = 1;
    uint256[] randomWords = new uint256[](1);
    uint256 public requestId;

    // NFT Variables
    uint256 public constant TOTAL_POKEMON = 1025;
    uint256 public constant num_copies = 10;
    uint256 public constant MAX_SUPPLY = TOTAL_POKEMON * num_copies;
    uint256 public mintPrice = 0.08 ether;
    string public baseURI;

    mapping(uint256 => uint8) pokemonCopiesMinted;

    // Mint request tracking
    struct MintRequest {
        address minter;
        uint256 quantity;
    }
    mapping(uint256 => MintRequest) public mintRequests;

    // Events
    event MintRequested(
        address indexed minter,
        uint256 quantity,
        uint256 requestId
    );
    event MintCompleted(
        address indexed minter,
        uint256[] tokenIds,
        uint256 requestId
    );

    constructor() ERC721A("Pokemon NFT", "PKMN") Ownable(msg.sender) {}

    // Override _sequentialUpTo to return 1
    // This allows for spot minting instead of sequential minting
    function _sequentialUpTo()
        internal
        view
        virtual
        override
        returns (uint256)
    {
        return 1;
    }

    // Request to mint NFTs
    function requestMint(uint256 quantity) external payable {
        require(
            totalSupply() + quantity <= MAX_SUPPLY,
            "Would exceed max supply"
        );
        require(msg.value >= mintPrice * quantity, "Insufficient payment");

        // Generate a pseudo-random requestId using block.timestamp and block.difficulty
        randomWords[0] = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao))
        );

        mintRequests[requestId] = MintRequest(msg.sender, quantity);
        emit MintRequested(msg.sender, quantity, requestId);

        fulfillRandomWords(requestId, randomWords);
        requestId++;
    }

    // Callback function for VRF
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal {
        MintRequest memory request = mintRequests[_requestId];
        uint256[] memory tokenIds = new uint256[](request.quantity);

        for (uint256 i = 0; i < request.quantity; i++) {
            uint256 randomNum = uint256(
                keccak256(abi.encode(_randomWords[0], i))
            );
            uint256 pokemonId = selectPokemon(randomNum);
            uint256 tokenId = (pokemonId * num_copies) +
                (pokemonCopiesMinted[pokemonId] - 1);

            _mintSpot(request.minter, tokenId);
            tokenIds[i] = tokenId;
        }

        emit MintCompleted(request.minter, tokenIds, _requestId);
        delete mintRequests[_requestId];
    }

    // Selects a Pokemon ID based on a random number and ensures the copy limit is not exceeded
    function selectPokemon(uint256 randomNum) internal returns (uint256) {
        uint256 pokemonId = (randomNum % TOTAL_POKEMON) + 1;

        // Check how many copies have been made
        if (pokemonCopiesMinted[pokemonId] < num_copies) {
            pokemonCopiesMinted[pokemonId]++;
            return pokemonId;
        }

        // If the selected Pokemon has reached the copy limit, perform a linear search for an available Pokemon
        uint256 startId = pokemonId;
        for (uint256 i = 0; i < TOTAL_POKEMON; i++) {
            pokemonId = ((startId + i - 1) % TOTAL_POKEMON) + 1;
            if (pokemonCopiesMinted[pokemonId] < num_copies) {
                pokemonCopiesMinted[pokemonId]++;
                return pokemonId;
            }
        }

        // If no available Pokemon found (should not happen), revert the transaction
        revert("No available Pokemon to mint");
    }

    // URI Functions
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory baseURI_ = _baseURI();
        return
            bytes(baseURI_).length != 0
                ? string(
                    abi.encodePacked(baseURI_, tokenId.toString(), ".json")
                )
                : "";
    }

    // Withdraw function
    function withdraw() external onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
