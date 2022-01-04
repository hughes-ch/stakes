// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Karma.sol";

/// @title User generated NFT which can be shared and bought
/// @author Chris Hughes
/// @dev Find more information here: https://github.com/hughes-ch/stakes
contract Content is ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;
    Karma private karma; 
    
    /// @notice Maintains state of a single NFT
    struct ContentNft {
        string txt;
        uint256 price;
        uint256 karma;
        address creator;
    }

    mapping(uint256 => ContentNft) private content;

    /// @notice Constructor
    /// @param _karma Address to the Karma contract
    constructor(Karma _karma) ERC721("Content", "CTNT") {
        karma = _karma;
    }
    
    /// @notice Creates a new NFT
    /// @param _txt The text to include in the NFT
    /// @param _price The price for another user to buy the NFT
    function publish(string memory _txt, uint256 _price)
    public
    returns (uint256)
    {
        require(bytes(_txt).length > 0);

        tokenIds.increment();

        uint256 itemId = tokenIds.current();
        _safeMint(msg.sender, itemId);
        content[itemId] = ContentNft({
            txt: _txt,
            price: _price,
            karma: 0,
            creator: msg.sender
        });
        return itemId;
    }

    /// @notice Returns the NFT with the given token ID, if it exists
    /// @param _tokenId The ID of the NFT
    /// @dev returns (txt, price, karma, creator) of NFT
    function getContentNft(uint256 _tokenId)
        public
        view
        returns (string memory, uint, uint, address)
    {
        ContentNft memory nft = content[_tokenId];
        require(bytes(nft.txt).length > 0);
        return (nft.txt, nft.price, nft.karma, nft.creator);
    }

    /// @notice Adds karma to a piece of content. This also pays the owner.
    /// @param _tokenId The ID of the NFT
    /// @param _amount The amount of Karma to transfer
    function addKarmaTo(uint256 _tokenId, uint256 _amount) public {
        address ownerAddress = ownerOf(_tokenId);
        karma.transferFrom(msg.sender, ownerAddress, _amount);
        content[_tokenId].karma += _amount;
    }

    /// @notice Sets the price of a given NFT
    /// @param _tokenId The ID of the NFT
    /// @param _amount The new price
    /// @dev Only the owner of the token may call this function
    function setPrice(uint256 _tokenId, uint256 _amount) public {
        require(ownerOf(_tokenId) == msg.sender);
        content[_tokenId].price = _amount;
    }
}
