// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
// import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFCoordinatorV2Interface} from "chainlink-brownie-contracts/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
// import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import {VRFConsumerBaseV2} from "chainlink-brownie-contracts/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

contract PokemonNFT is ERC721A, VRFConsumerBaseV2, Ownable {
    using Strings for uint256;

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 2500000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    // NFT Variables
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.08 ether;
    string public baseURI;
    bool public revealed = false;

    // Rarity Variables
    uint256 public constant TOTAL_POKEMON = 1025;
    mapping(uint256 => bool) public legendaryMinted;
    mapping(uint256 => uint8) public pokemonRarity; // 1=Common, 2=Uncommon, 3=Rare, 4=Legendary

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
    event MintCompleted(address indexed minter, uint256[] tokenIds);

    constructor(
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash
    )
        ERC721A("Pokemon NFT", "PKMN")
        VRFConsumerBaseV2(_vrfCoordinator)
        Ownable(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        s_subscriptionId = _subscriptionId;
        keyHash = _keyHash;

        // Initialize rarity mapping (this would be done in deployment script)
        // Example: pokemonRarity[1] = 1; // Common
    }

    // Request to mint NFTs
    function requestMint(uint256 quantity) external payable {
        require(
            totalSupply() + quantity <= MAX_SUPPLY,
            "Would exceed max supply"
        );
        require(msg.value >= mintPrice * quantity, "Insufficient payment");

        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        mintRequests[requestId] = MintRequest(msg.sender, quantity);
        emit MintRequested(msg.sender, quantity, requestId);
    }

    // Callback function for VRF
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        MintRequest memory request = mintRequests[requestId];
        uint256[] memory tokenIds = new uint256[](request.quantity);

        for (uint256 i = 0; i < request.quantity; i++) {
            uint256 randomNum = uint256(
                keccak256(abi.encode(randomWords[0], i))
            );
            uint256 pokemonId = selectPokemon(randomNum);

            _mint(request.minter, 1);
            tokenIds[i] = _nextTokenId() - 1;
        }

        emit MintCompleted(request.minter, tokenIds);
        delete mintRequests[requestId];
    }

    // Select Pokemon based on rarity weights
    function selectPokemon(uint256 randomNum) internal returns (uint256) {
        uint256 rarity = randomNum % 100;
        uint256 attempts = 0;

        // Rarity distribution: 50% Common, 30% Uncommon, 15% Rare, 5% Legendary
        uint8 selectedRarity;
        if (rarity < 50)
            selectedRarity = 1; // Common
        else if (rarity < 80)
            selectedRarity = 2; // Uncommon
        else if (rarity < 95)
            selectedRarity = 3; // Rare
        else selectedRarity = 4; // Legendary

        while (attempts < 100) {
            uint256 pokemonId = (uint256(
                keccak256(abi.encode(randomNum, attempts))
            ) % TOTAL_POKEMON) + 1;

            if (pokemonRarity[pokemonId] == selectedRarity) {
                if (selectedRarity == 4) {
                    // Legendary
                    if (!legendaryMinted[pokemonId]) {
                        legendaryMinted[pokemonId] = true;
                        return pokemonId;
                    }
                } else {
                    return pokemonId;
                }
            }
            attempts++;
        }

        // Fallback to common if no match found
        return (randomNum % TOTAL_POKEMON) + 1;
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
