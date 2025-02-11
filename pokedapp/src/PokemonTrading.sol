// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC721A} from "lib/ERC721A/contracts/ERC721A.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {Math} from "openzeppelin-contracts/contracts/utils/math/Math.sol";

contract PokemonTrading is Ownable, ReentrancyGuard {
    using Math for uint256;

    enum SaleType {
        FixedPrice,
        Auction
    }

    struct Sale {
        address seller;
        uint256 tokenId;
        SaleType saleType;
        uint256 price;
        uint256 highestBid;
        address highestBidder;
        bool active;
        uint256 endTime;
    }

    mapping(uint256 => Sale) public sales;
    uint256 public saleCount;
    ERC721A public nftContract;

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = ERC721A(_nftContract);
        saleCount = 0;
    }

    event SaleCreated(
        uint256 saleId,
        address seller,
        uint256 tokenId,
        SaleType saleType,
        uint256 price
    );
    event SaleCancelled(uint256 saleId);
    event SaleCompleted(uint256 saleId, address buyer);
    event NewBid(uint256 saleId, address bidder, uint256 bid);

    modifier onlySeller(uint256 saleId) {
        require(sales[saleId].seller == msg.sender, "Not the seller");
        _;
    }

    modifier saleExists(uint256 saleId) {
        require(sales[saleId].seller != address(0), "Sale does not exist");
        _;
    }

    function createFixedPriceSale(
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        // Ensure the contract is approved to transfer the token
        require(
            nftContract.getApproved(tokenId) == address(this),
            "Contract not approved to transfer token"
        );
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        sales[saleCount] = Sale({
            seller: msg.sender,
            tokenId: tokenId,
            saleType: SaleType.FixedPrice,
            price: price,
            highestBid: 0,
            highestBidder: address(0),
            active: true,
            endTime: 0
        });

        emit SaleCreated(
            saleCount,
            msg.sender,
            tokenId,
            SaleType.FixedPrice,
            price
        );
        saleCount++;
    }

    function createAuctionSale(
        uint256 tokenId,
        uint256 startingPrice
    ) external nonReentrant {
        // Ensure the contract is approved to transfer the token
        require(
            nftContract.getApproved(tokenId) == address(this),
            "Contract not approved to transfer token"
        );
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        sales[saleCount] = Sale({
            seller: msg.sender,
            tokenId: tokenId,
            saleType: SaleType.Auction,
            price: startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            active: true,
            endTime: block.timestamp + 24 hours // Auctions end after 24 hours
        });

        emit SaleCreated(
            saleCount,
            msg.sender,
            tokenId,
            SaleType.Auction,
            startingPrice
        );
        saleCount++;
    }

    function buy(
        uint256 saleId
    ) external payable nonReentrant saleExists(saleId) {
        Sale storage sale = sales[saleId];
        require(sale.saleType == SaleType.FixedPrice, "Not a fixed price sale");
        require(msg.value == sale.price, "Incorrect price");
        require(sale.active, "Sale not active");

        sale.active = false;
        nftContract.transferFrom(address(this), msg.sender, sale.tokenId);
        payable(sale.seller).transfer(msg.value);

        emit SaleCompleted(saleId, msg.sender);
    }

    function bid(
        uint256 saleId
    ) external payable nonReentrant saleExists(saleId) {
        Sale storage sale = sales[saleId];
        require(sale.saleType == SaleType.Auction, "Not an auction sale");
        require(block.timestamp < sale.endTime, "Auction has ended");
        require(msg.value > sale.highestBid, "Bid too low");
        require(sale.active, "Sale not active");

        if (sale.highestBidder != address(0)) {
            payable(sale.highestBidder).transfer(sale.highestBid);
        }

        sale.highestBid = msg.value;
        sale.highestBidder = msg.sender;

        emit NewBid(saleId, msg.sender, msg.value);
    }

    function acceptHighestBid(
        uint256 saleId
    ) external nonReentrant onlySeller(saleId) saleExists(saleId) {
        Sale storage sale = sales[saleId];
        require(sale.saleType == SaleType.Auction, "Not an auction sale");
        require(sale.active, "Sale not active");
        require(block.timestamp < sale.endTime, "Auction has ended");

        sale.active = false;
        nftContract.transferFrom(
            address(this),
            sale.highestBidder,
            sale.tokenId
        );
        payable(sale.seller).transfer(sale.highestBid);

        emit SaleCompleted(saleId, sale.highestBidder);
    }

    function cancelSale(
        uint256 saleId
    ) external nonReentrant onlySeller(saleId) saleExists(saleId) {
        Sale storage sale = sales[saleId];
        require(sale.active, "Sale not active");

        sale.active = false;
        nftContract.transferFrom(address(this), sale.seller, sale.tokenId);

        if (
            sale.saleType == SaleType.Auction &&
            sale.highestBidder != address(0)
        ) {
            payable(sale.highestBidder).transfer(sale.highestBid);
        }

        emit SaleCancelled(saleId);
    }

    function emergencyStop() external onlyOwner nonReentrant {
        // Refund highest bids for active auctions
        for (uint256 i = 0; i < saleCount; i++) {
            if (
                sales[i].active &&
                sales[i].saleType == SaleType.Auction &&
                sales[i].highestBidder != address(0)
            ) {
                payable(sales[i].highestBidder).transfer(sales[i].highestBid);
                sales[i].highestBid = 0;
                sales[i].highestBidder = address(0);
            }
        }

        // Transfer any remaining funds to the owner
        payable(owner()).transfer(address(this).balance);
    }

    function getActiveSales() external view returns (Sale[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < saleCount; i++) {
            if (sales[i].active) {
                activeCount++;
            }
        }

        Sale[] memory activeSales = new Sale[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < saleCount; i++) {
            if (sales[i].active) {
                activeSales[index] = sales[i];
                index++;
            }
        }

        return activeSales;
    }

    function getSaleDetails(
        uint256 saleId
    ) external view saleExists(saleId) returns (Sale memory) {
        return sales[saleId];
    }

    function finalizeExpiredAuction(
        uint256 saleId
    ) external nonReentrant saleExists(saleId) {
        Sale storage sale = sales[saleId];
        require(sale.saleType == SaleType.Auction, "Not an auction sale");
        require(block.timestamp >= sale.endTime, "Auction has not ended yet");
        require(sale.active, "Sale not active");

        sale.active = false;
        nftContract.transferFrom(address(this), sale.seller, sale.tokenId);

        if (sale.highestBidder != address(0)) {
            payable(sale.highestBidder).transfer(sale.highestBid);
        }

        emit SaleCancelled(saleId);
    }
}
