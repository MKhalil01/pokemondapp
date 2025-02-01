// a trading contract that enables card listing, supports both fixed-price sales
// and auctions, and implements secure withdrawal patterns

// protection against reentrancy attacks. Access
// control must be properly implemented using function modifiers and role-based access where necessary.
// If front-running could be a concern, then students should design and add afront-running preven-
// tion (e.g., through the implementation of commit-reveal schemes or similar mechanisms for sensitive
// operations). Additionally, students should implement protection against integer overflow, proper event
// emission, and emergency stop functionality

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract PokemonTrading is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    enum SaleType {
        FixedPrice,
        Auction
    }

    struct Sale {
        address seller;
        address nftContract;
        uint256 tokenId;
        SaleType saleType;
        uint256 price;
        uint256 highestBid;
        address highestBidder;
        bool active;
    }

    mapping(uint256 => Sale) public sales;
    uint256 public saleCount;

    event SaleCreated(
        uint256 saleId,
        address seller,
        address nftContract,
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
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        sales[saleCount] = Sale({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            saleType: SaleType.FixedPrice,
            price: price,
            highestBid: 0,
            highestBidder: address(0),
            active: true
        });

        emit SaleCreated(
            saleCount,
            msg.sender,
            nftContract,
            tokenId,
            SaleType.FixedPrice,
            price
        );
        saleCount++;
    }

    function createAuctionSale(
        address nftContract,
        uint256 tokenId,
        uint256 startingPrice
    ) external nonReentrant {
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        sales[saleCount] = Sale({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            saleType: SaleType.Auction,
            price: startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            active: true
        });

        emit SaleCreated(
            saleCount,
            msg.sender,
            nftContract,
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
        IERC721(sale.nftContract).transferFrom(
            address(this),
            msg.sender,
            sale.tokenId
        );
        payable(sale.seller).transfer(msg.value);

        emit SaleCompleted(saleId, msg.sender);
    }

    function bid(
        uint256 saleId
    ) external payable nonReentrant saleExists(saleId) {
        Sale storage sale = sales[saleId];
        require(sale.saleType == SaleType.Auction, "Not an auction sale");
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

        sale.active = false;
        IERC721(sale.nftContract).transferFrom(
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
        IERC721(sale.nftContract).transferFrom(
            address(this),
            sale.seller,
            sale.tokenId
        );

        if (
            sale.saleType == SaleType.Auction &&
            sale.highestBidder != address(0)
        ) {
            payable(sale.highestBidder).transfer(sale.highestBid);
        }

        emit SaleCancelled(saleId);
    }

    function emergencyStop() external onlyOwner {
        selfdestruct(payable(owner()));
    }

    // Add a function to get all active sales
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

    // Add a function to get details of a specific sale
    function getSaleDetails(
        uint256 saleId
    ) external view saleExists(saleId) returns (Sale memory) {
        return sales[saleId];
    }
}
