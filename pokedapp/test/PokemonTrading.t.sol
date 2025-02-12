// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test, console, Vm} from "forge-std/Test.sol";
import {PokemonTrading} from "../src/PokemonTrading.sol";
import {PokemonNFT} from "../src/PokemonNFT.sol";
import {MockVRFCoordinator} from "../src/MockVRFCoordinator.sol";

contract PokemonTradingTest is Test {
    PokemonTrading pokemonTrading;
    PokemonNFT pokemonNFT;
    MockVRFCoordinator mockVRFCoordinator;

    address addr1 = address(0x123);
    address addr2 = address(0x456);
    address addr3 = address(0x789);

    function setUp() public {
        // Fund the test addresses with Ether
        vm.deal(addr1, 500 ether);
        vm.deal(addr2, 500 ether);
        vm.deal(addr3, 500 ether);

        // Deploy the contracts
        mockVRFCoordinator = new MockVRFCoordinator();
        pokemonNFT = new PokemonNFT(address(mockVRFCoordinator));
        pokemonTrading = new PokemonTrading(address(pokemonNFT));
    }

    function testOwners() public {
        // Transfer ownership to the test owner
        pokemonTrading.transferOwnership(addr1);
        pokemonNFT.transferOwnership(addr1);

        // Check that the owners are correct
        assertEq(
            pokemonTrading.owner(),
            addr1,
            "PokemonTrading owner is incorrect"
        );
        assertEq(pokemonNFT.owner(), addr1, "PokemonNFT owner is incorrect");
    }

    function testMint() public {
        uint256 mintPrice = pokemonNFT.mintPrice();
        uint256 initialSupply = pokemonNFT.totalSupply();

        // Get balance of addr1 before minting
        uint256 balanceAddr1BeforeMint = addr1.balance;

        // Mint one NFT for addr1
        vm.prank(addr1);
        pokemonNFT.requestMint{value: mintPrice}(1);

        // Verify that the total supply has increased by 1
        assertEq(
            pokemonNFT.totalSupply(),
            initialSupply + 1,
            "Total supply should be 1"
        );

        // Get balance of addr1 after minting
        uint256 balanceAddr1AfterMint = addr1.balance;

        // Verify that the balance of addr1 went down by the mint price
        assertEq(
            balanceAddr1BeforeMint - balanceAddr1AfterMint,
            mintPrice,
            "addr1 balance should decrease by the mint price"
        );

        // Get balance of addr2 before minting
        uint256 balanceAddr2BeforeMint = addr2.balance;

        // Mint 1000 NFTs for addr2
        vm.prank(addr2);
        pokemonNFT.requestMint{value: 1000 * mintPrice}(1000);

        // Verify that the total supply has increased by 1000
        assertEq(
            pokemonNFT.totalSupply(),
            initialSupply + 1001,
            "Total supply should be 1001"
        );

        // Get balance of addr2 after minting
        uint256 balanceAddr2AfterMint = addr2.balance;

        // Verify that the balance of addr2 went down by the mint price
        assertEq(
            balanceAddr2BeforeMint - balanceAddr2AfterMint,
            1000 * mintPrice,
            "addr2 balance should decrease by the mint price"
        );

        // Request to mint more than the max supply
        vm.prank(addr2);
        vm.expectRevert("Would exceed max supply");
        pokemonNFT.requestMint(10251);

        // Request to mint without enough payment
        vm.prank(addr2);
        vm.expectRevert("Insufficient payment");
        pokemonNFT.requestMint{value: 0}(1);
    }

    function testFixedPriceSale() public {
        uint256 mintPrice = pokemonNFT.mintPrice();

        // Request to mint one NFT
        vm.prank(addr1);
        vm.recordLogs();
        pokemonNFT.requestMint{value: mintPrice}(1);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Get the token ID of the minted NFT
        uint256 tokenId = uint256(logs[1].topics[3]);

        // Approve the PokemonTrading contract to transfer the tokenId
        vm.prank(addr1);
        pokemonNFT.approve(address(pokemonTrading), tokenId);

        // Create a fixed price sale for the minted NFT
        uint256 salePrice = 0.1 ether;
        vm.prank(addr1);
        pokemonTrading.createFixedPriceSale(tokenId, salePrice);

        uint256 saleId = 0;

        // Verify that the sale has been created
        PokemonTrading.Sale memory sale = pokemonTrading.getSaleDetails(saleId);

        assertEq(sale.seller, addr1, "Seller should be addr1");
        assertEq(
            sale.tokenId,
            tokenId,
            "Token ID should match the minted token ID"
        );
        assertEq(
            uint256(sale.saleType),
            uint256(PokemonTrading.SaleType.FixedPrice),
            "Sale type should be FixedPrice"
        );
        assertEq(sale.price, salePrice, "Sale price should be 0.1 ether");
        assertEq(sale.highestBid, 0, "Highest bid should be 0");
        assertEq(
            sale.highestBidder,
            address(0),
            "Highest bidder should be address(0)"
        );
        assertTrue(sale.active, "Sale should be active");
        assertEq(sale.endTime, 0, "End time should be 0 for fixed price sale");

        // Get balances before the purchase
        uint256 balanceAddr1BeforeSale = addr1.balance;
        uint256 balanceAddr2BeforeSale = addr2.balance;

        // addr2 buys the NFT
        vm.prank(addr2);
        pokemonTrading.buy{value: salePrice}(saleId);

        // Verify that the sale is no longer active
        sale = pokemonTrading.getSaleDetails(saleId);
        assertFalse(sale.active, "Sale should be inactive after purchase");

        // Verify that addr2 is the new owner of the NFT
        assertEq(
            pokemonNFT.ownerOf(tokenId),
            addr2,
            "addr2 should be the new owner of the NFT"
        );

        // Get balances after the purchase
        uint256 balanceAddr1AfterSale = addr1.balance;
        uint256 balanceAddr2AfterSale = addr2.balance;

        // Verify that the balance of addr2 went down by the sale price
        assertEq(
            balanceAddr2BeforeSale - balanceAddr2AfterSale,
            salePrice,
            "addr2 balance should decrease by the sale price"
        );

        // Verify that the balance of addr1 went up by the sale price
        assertEq(
            balanceAddr1AfterSale - balanceAddr1BeforeSale,
            salePrice,
            "addr1 balance should increase by the sale price"
        );

        // Attempt to buy a non-existent fixed price sale
        saleId = 1;
        vm.prank(addr2);
        vm.expectRevert("Sale does not exist");
        pokemonTrading.buy{value: salePrice}(saleId);

        // Attempt to create a fixed price sale without approval
        vm.prank(addr1);
        vm.expectRevert("Contract not approved to transfer token");
        pokemonTrading.createFixedPriceSale(tokenId, salePrice);
    }

    function testAuctionSale() public {
        uint256 mintPrice = pokemonNFT.mintPrice();

        // Request to mint one NFT
        vm.prank(addr1);
        vm.recordLogs();
        pokemonNFT.requestMint{value: mintPrice}(1);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Get the token ID of the minted NFT
        uint256 tokenId = uint256(logs[1].topics[3]);

        // Get balances before the auction
        uint256 balanceAddr1BeforeAuction = addr1.balance;
        uint256 balanceAddr2BeforeAuction = addr2.balance;
        uint256 balanceAddr3BeforeAuction = addr3.balance;

        // Approve the PokemonTrading contract to transfer the tokenId
        vm.prank(addr1);
        pokemonNFT.approve(address(pokemonTrading), tokenId);

        // Create an auction sale for the minted NFT
        uint256 startingPrice = 0.1 ether;
        vm.prank(addr1);
        pokemonTrading.createAuctionSale(tokenId, startingPrice);

        // Verify that the auction sale has been created
        uint256 saleId = 0;
        PokemonTrading.Sale memory sale = pokemonTrading.getSaleDetails(saleId);

        assertEq(sale.seller, addr1, "Seller should be addr1");
        assertEq(
            sale.tokenId,
            tokenId,
            "Token ID should match the minted token ID"
        );
        assertEq(
            uint256(sale.saleType),
            uint256(PokemonTrading.SaleType.Auction),
            "Sale type should be Auction"
        );
        assertEq(
            sale.price,
            startingPrice,
            "Starting price should be 0.1 ether"
        );
        assertEq(sale.highestBid, 0, "Highest bid should be 0");
        assertEq(
            sale.highestBidder,
            address(0),
            "Highest bidder should be address(0)"
        );
        assertTrue(sale.active, "Sale should be active");
        assertEq(
            sale.endTime,
            block.timestamp + 24 hours,
            "End time should be 24hrs in the future"
        );

        // Place a bid from addr2
        uint256 bidAmount1 = 0.2 ether;
        vm.prank(addr2);
        pokemonTrading.bid{value: bidAmount1}(saleId);

        // Verify that the highest bid and bidder are updated
        sale = pokemonTrading.getSaleDetails(saleId);
        assertEq(
            sale.highestBid,
            bidAmount1,
            "Highest bid should be 0.2 ether"
        );
        assertEq(sale.highestBidder, addr2, "Highest bidder should be addr2");

        // Place a higher bid from addr3
        uint256 bidAmount2 = 0.3 ether;
        vm.prank(addr3);
        pokemonTrading.bid{value: bidAmount2}(saleId);

        // Verify that the highest bid and bidder are updated
        sale = pokemonTrading.getSaleDetails(saleId);
        assertEq(
            sale.highestBid,
            bidAmount2,
            "Highest bid should be 0.3 ether"
        );
        assertEq(sale.highestBidder, addr3, "Highest bidder should be addr3");

        // Attempt to place a lower bid from addr2
        uint256 lowerBidAmount = 0.25 ether;
        vm.prank(addr2);
        vm.expectRevert("Bid too low");
        pokemonTrading.bid{value: lowerBidAmount}(saleId);

        // Accept the highest bid
        vm.prank(addr1);
        pokemonTrading.acceptHighestBid(saleId);

        // Verify that the sale is no longer active
        sale = pokemonTrading.getSaleDetails(saleId);
        assertFalse(
            sale.active,
            "Sale should be inactive after accepting the highest bid"
        );

        // Verify that addr3 is the new owner of the NFT
        assertEq(
            pokemonNFT.ownerOf(tokenId),
            addr3,
            "addr3 should be the new owner of the NFT"
        );

        // Get balances after the auction
        uint256 balanceAddr1AfterAuction = addr1.balance;
        uint256 balanceAddr2AfterAuction = addr2.balance;
        uint256 balanceAddr3AfterAuction = addr3.balance;

        // Verify that the balance of addr3 went down by the highest bid amount
        assertEq(
            balanceAddr3BeforeAuction - balanceAddr3AfterAuction,
            bidAmount2,
            "addr3 balance should decrease by the highest bid amount"
        );

        // Verify that the balance of addr1 went up by the highest bid amount
        assertEq(
            balanceAddr1AfterAuction - balanceAddr1BeforeAuction,
            bidAmount2,
            "addr1 balance should increase by the highest bid amount"
        );

        // Verify that the balance of addr2 was refunded
        assertEq(
            balanceAddr2AfterAuction,
            balanceAddr2BeforeAuction,
            "addr2 balance should be refunded"
        );

        // Attempt to place a bid on a non-existent auction
        saleId = 1;
        vm.prank(addr2);
        vm.expectRevert("Sale does not exist");
        pokemonTrading.bid{value: bidAmount1}(saleId);

        // Attempt to create an auction sale without approval
        vm.prank(addr1);
        vm.expectRevert("Contract not approved to transfer token");
        pokemonTrading.createAuctionSale(tokenId, startingPrice);
    }

    function testCancelSales() public {
        uint256 mintPrice = pokemonNFT.mintPrice();

        // Request to mint one NFT
        vm.prank(addr1);
        vm.recordLogs();
        pokemonNFT.requestMint{value: mintPrice}(1);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Get the token ID of the minted NFT
        uint256 tokenId = uint256(logs[1].topics[3]);

        // Approve the PokemonTrading contract to transfer the tokenId
        vm.prank(addr1);
        pokemonNFT.approve(address(pokemonTrading), tokenId);

        // Create a fixed price sale for the minted NFT
        uint256 salePrice = 0.1 ether;
        vm.prank(addr1);
        pokemonTrading.createFixedPriceSale(tokenId, salePrice);

        // Verify that the fixed price sale has been created
        uint256 fixedPriceSaleId = 0;
        PokemonTrading.Sale memory fixedPriceSale = pokemonTrading
            .getSaleDetails(fixedPriceSaleId);
        assertTrue(fixedPriceSale.active, "Sale should be active");

        // Verify that the contract is the owner of the NFT
        assertEq(
            pokemonNFT.ownerOf(tokenId),
            address(pokemonTrading),
            "pokemonTrading should be the owner of the NFT during the sale"
        );

        // Attempt to cancel the sale by a non-seller
        vm.prank(addr2);
        vm.expectRevert("Not the seller");
        pokemonTrading.cancelSale(fixedPriceSaleId);

        // Cancel the fixed price sale
        vm.prank(addr1);
        pokemonTrading.cancelSale(fixedPriceSaleId);

        // Verify that the fixed price sale is no longer active
        fixedPriceSale = pokemonTrading.getSaleDetails(fixedPriceSaleId);
        assertFalse(
            fixedPriceSale.active,
            "Fixed price sale should be inactive after cancellation"
        );

        // Verify that addr1 is the owner of the NFT again
        assertEq(
            pokemonNFT.ownerOf(tokenId),
            addr1,
            "addr1 should be the owner of the NFT after cancellation"
        );

        // Attempt to buy the fixed price sale after it has been canceled
        vm.prank(addr2);
        vm.expectRevert("Sale not active");
        pokemonTrading.buy{value: salePrice}(fixedPriceSaleId);

        // Approve the PokemonTrading contract to transfer the tokenId
        vm.prank(addr1);
        pokemonNFT.approve(address(pokemonTrading), tokenId);

        // Create an auction sale for the minted NFT
        uint256 startingPrice = 0.1 ether;
        vm.prank(addr1);
        pokemonTrading.createAuctionSale(tokenId, startingPrice);

        // Verify that the auction sale has been created
        uint256 auctionSaleId = 1;
        PokemonTrading.Sale memory auctionSale = pokemonTrading.getSaleDetails(
            auctionSaleId
        );
        assertTrue(auctionSale.active, "Sale should be active");

        // Verify that the contract is the owner of the NFT
        assertEq(
            pokemonNFT.ownerOf(tokenId),
            address(pokemonTrading),
            "pokemonTrading should be the owner of the NFT during the sale"
        );

        // Attempt to cancel the sale by a non-seller
        vm.prank(addr2);
        vm.expectRevert("Not the seller");
        pokemonTrading.cancelSale(auctionSaleId);

        // Cancel the auction sale
        vm.prank(addr1);
        pokemonTrading.cancelSale(auctionSaleId);

        // Verify that the auction sale is no longer active
        auctionSale = pokemonTrading.getSaleDetails(auctionSaleId);
        assertFalse(
            auctionSale.active,
            "Auction sale should be inactive after cancellation"
        );

        // Verify that addr1 is the owner of the NFT again
        assertEq(
            pokemonNFT.ownerOf(tokenId),
            addr1,
            "addr1 should be the owner of the NFT after cancellation"
        );

        // Attempt to bid on the auction sale after it has been canceled
        vm.prank(addr2);
        vm.expectRevert("Sale not active");
        pokemonTrading.bid{value: 0.2 ether}(auctionSaleId);
    }

    function testExpiredAuction() public {
        uint256 mintPrice = pokemonNFT.mintPrice();

        // Request to mint one NFT
        vm.prank(addr1);
        vm.recordLogs();
        pokemonNFT.requestMint{value: mintPrice}(1);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Get the token ID of the minted NFT
        uint256 tokenId = uint256(logs[1].topics[3]);

        // Approve the PokemonTrading contract to transfer the tokenId
        vm.prank(addr1);
        pokemonNFT.approve(address(pokemonTrading), tokenId);

        // Create an auction sale for the minted NFT
        uint256 startingPrice = 0.1 ether;
        vm.prank(addr1);
        pokemonTrading.createAuctionSale(tokenId, startingPrice);

        // Verify that the auction sale has been created
        uint256 saleId = 0;
        PokemonTrading.Sale memory sale = pokemonTrading.getSaleDetails(saleId);
        assertTrue(sale.active, "Sale should be active");

        // Place a bid from addr2
        uint256 bidAmount1 = 0.2 ether;
        vm.prank(addr2);
        pokemonTrading.bid{value: bidAmount1}(saleId);

        // Attempt to finalize the auction before it has ended
        vm.prank(addr1);
        vm.expectRevert("Auction has not ended yet");
        pokemonTrading.finalizeExpiredAuction(saleId);

        // Fast forward time to after the auction end time
        vm.warp(block.timestamp + 25 hours);

        // Get balance of addr2 before finalizing the auction
        uint256 balanceAddr2BeforeFinalize = addr2.balance;

        // Finalize the expired auction
        vm.prank(addr1);
        pokemonTrading.finalizeExpiredAuction(saleId);

        // Verify that the auction sale is no longer active
        sale = pokemonTrading.getSaleDetails(saleId);
        assertFalse(
            sale.active,
            "Auction sale should be inactive after expiration"
        );

        // Verify that addr1 is the owner of the NFT again
        assertEq(
            pokemonNFT.ownerOf(tokenId),
            addr1,
            "addr1 should be the owner of the NFT after expiration"
        );

        // Verify that addr2 received a refund
        uint256 balanceAddr2AfterFinalize = addr2.balance;
        assertEq(
            balanceAddr2AfterFinalize,
            balanceAddr2BeforeFinalize + bidAmount1,
            "addr2 should receive a refund"
        );

        // Attempt to accept the highest bid after the auction has ended
        vm.prank(addr1);
        vm.expectRevert("Sale not active");
        pokemonTrading.acceptHighestBid(saleId);
    }

    function testEmergencyStop() public {
        uint256 mintPrice = pokemonNFT.mintPrice();

        // Request to mint one NFT
        vm.prank(addr1);
        vm.recordLogs();
        pokemonNFT.requestMint{value: mintPrice}(1);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        // Get the token ID of the minted NFT
        uint256 tokenId = uint256(logs[1].topics[3]);

        // Approve the PokemonTrading contract to transfer the tokenId
        vm.prank(addr1);
        pokemonNFT.approve(address(pokemonTrading), tokenId);

        // Create an auction sale for the minted NFT
        uint256 startingPrice = 0.1 ether;
        vm.prank(addr1);
        pokemonTrading.createAuctionSale(tokenId, startingPrice);

        // Verify that the auction sale has been created
        uint256 saleId = 0;
        PokemonTrading.Sale memory sale = pokemonTrading.getSaleDetails(saleId);

        assertTrue(sale.active, "Sale should be active");

        // Place a bid from addr2
        uint256 bidAmount1 = 0.2 ether;
        vm.prank(addr2);
        pokemonTrading.bid{value: bidAmount1}(saleId);

        // Get balances before emergency stop
        uint256 balanceAddr1Before = addr1.balance;
        uint256 balanceAddr2Before = addr2.balance;
        uint256 contractBalanceBefore = address(pokemonTrading).balance;

        // Transfer ownership to the test owner
        pokemonTrading.transferOwnership(addr1);

        // Attempt to call emergency stop by a non-owner
        vm.prank(addr2);
        vm.expectRevert();
        pokemonTrading.emergencyStop();

        // Call emergency stop
        vm.prank(addr1);
        pokemonTrading.emergencyStop();

        // Verify that the auction sale is no longer active
        sale = pokemonTrading.getSaleDetails(saleId);
        assertFalse(
            sale.active,
            "Auction sale should be inactive after emergency stop"
        );

        // Verify that addr1 is the owner of the NFT again
        assertEq(
            pokemonNFT.ownerOf(tokenId),
            addr1,
            "addr1 should be the owner of the NFT after emergency stop"
        );

        // Verify that addr2 received a refund
        uint256 balanceAddr2After = addr2.balance;
        assertEq(
            balanceAddr2After,
            balanceAddr2Before + bidAmount1,
            "addr2 should receive a refund"
        );

        // Verify that the contract balance is transferred to the owner, less the refund to addr2
        uint256 balanceAddr1After = addr1.balance;
        assertEq(
            balanceAddr1After,
            balanceAddr1Before + contractBalanceBefore - bidAmount1,
            "addr1 should receive the contract balance"
        );
    }
}
