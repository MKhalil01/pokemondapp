// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract PokemonTrading is ReentrancyGuard {
    IERC721 public immutable nftContract;

    // Listing types
    enum ListingType { FixedPrice, Auction }

    struct Listing {
        address seller;
        uint256 price;
        ListingType listingType;
        // Auction specific fields
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
        bool ended;
    }

    // TokenId => Listing
    mapping(uint256 => Listing) public listings;
    
    // Events
    event Listed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        ListingType listingType,
        uint256 startTime,
        uint256 endTime
    );
    event Sale(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event AuctionBid(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 bid
    );
    event ListingCanceled(uint256 indexed tokenId, address indexed seller);
    event AuctionEnded(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 amount
    );

    // Minimum auction duration
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;

    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }

    // Create a fixed price listing
    function listFixedPrice(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be greater than 0");
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );
        require(
            nftContract.getApproved(tokenId) == address(this) ||
            nftContract.isApprovedForAll(msg.sender, address(this)),
            "Contract not approved"
        );

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            listingType: ListingType.FixedPrice,
            startTime: block.timestamp,
            endTime: 0,
            highestBidder: address(0),
            highestBid: 0,
            ended: false
        });

        emit Listed(
            tokenId,
            msg.sender,
            price,
            ListingType.FixedPrice,
            block.timestamp,
            0
        );
    }

    // Create an auction listing
    function listAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) external {
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(duration >= MIN_AUCTION_DURATION, "Duration too short");
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );
        require(
            nftContract.getApproved(tokenId) == address(this) ||
            nftContract.isApprovedForAll(msg.sender, address(this)),
            "Contract not approved"
        );

        uint256 endTime = block.timestamp + duration;

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: startingPrice,
            listingType: ListingType.Auction,
            startTime: block.timestamp,
            endTime: endTime,
            highestBidder: address(0),
            highestBid: 0,
            ended: false
        });

        emit Listed(
            tokenId,
            msg.sender,
            startingPrice,
            ListingType.Auction,
            block.timestamp,
            endTime
        );
    }

    // Purchase a fixed price listing
    function purchaseFixed(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.listingType == ListingType.FixedPrice, "Not a fixed price listing");
        require(!listing.ended, "Listing ended");
        require(msg.value >= listing.price, "Insufficient payment");

        _completePurchase(tokenId, listing.seller, msg.sender, listing.price);
    }

    // Place a bid on an auction
    function placeBid(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.listingType == ListingType.Auction, "Not an auction");
        require(!listing.ended, "Auction ended");
        require(block.timestamp < listing.endTime, "Auction expired");
        require(msg.value > listing.highestBid, "Bid too low");
        require(msg.sender != listing.seller, "Seller cannot bid");

        // Refund the previous highest bidder
        if (listing.highestBidder != address(0)) {
            _sendEther(listing.highestBidder, listing.highestBid);
        }

        listing.highestBidder = msg.sender;
        listing.highestBid = msg.value;

        emit AuctionBid(tokenId, msg.sender, msg.value);
    }

    // End an auction
    function endAuction(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.listingType == ListingType.Auction, "Not an auction");
        require(!listing.ended, "Auction already ended");
        require(
            block.timestamp >= listing.endTime,
            "Auction still in progress"
        );

        listing.ended = true;

        if (listing.highestBidder != address(0)) {
            _completePurchase(
                tokenId,
                listing.seller,
                listing.highestBidder,
                listing.highestBid
            );
            emit AuctionEnded(tokenId, listing.highestBidder, listing.highestBid);
        } else {
            // No bids were placed, return NFT to seller
            delete listings[tokenId];
            emit ListingCanceled(tokenId, listing.seller);
        }
    }

    // Cancel a listing (only if no bids for auction)
    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(msg.sender == listing.seller, "Not the seller");
        require(!listing.ended, "Listing already ended");
        
        if (listing.listingType == ListingType.Auction) {
            require(listing.highestBidder == address(0), "Bids already placed");
        }

        delete listings[tokenId];
        emit ListingCanceled(tokenId, msg.sender);
    }

    // Internal function to complete a purchase
    function _completePurchase(
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 price
    ) internal {
        delete listings[tokenId];
        
        // Transfer NFT to buyer
        nftContract.transferFrom(seller, buyer, tokenId);
        
        // Transfer payment to seller
        _sendEther(seller, price);

        emit Sale(tokenId, seller, buyer, price);
    }

    // Internal function to safely send ether
    function _sendEther(address to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Failed to send Ether");
    }
}