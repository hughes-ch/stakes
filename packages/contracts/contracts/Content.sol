// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Karma.sol";

/// @title User generated NFT which can be shared and bought
/// @author Chris Hughes
/// @dev Find more information here: https://github.com/hughes-ch/stakes
contract Content is BaseRelayRecipient, ERC721Enumerable {
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
    /// @param _trustedForwarder GSN trusted forwarder
    constructor(Karma _karma, address _trustedForwarder)
        ERC721("Content", "CTNT") {
        karma = _karma;
        _setTrustedForwarder(_trustedForwarder);
    }
    
    /// @notice Creates a new NFT
    /// @param _txt The text to include in the NFT
    /// @param _price The price for another user to buy the NFT
    function publish(string memory _txt, uint256 _price)
    public
    returns (uint256)
    {
        require(bytes(_txt).length > 0, "Cannot publish empty content");

        tokenIds.increment();

        uint256 itemId = tokenIds.current();
        _safeMint(_msgSender(), itemId);
        content[itemId] = ContentNft({
            txt: _txt,
            price: _price,
            karma: 0,
            creator: _msgSender()
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
        require(bytes(nft.txt).length > 0, "Invalid tokenId provided");
        return (nft.txt, nft.price, nft.karma, nft.creator);
    }

    /// @notice Adds karma to a piece of content. This also pays the owner.
    /// @param _tokenId The ID of the NFT
    /// @param _amount The amount of Karma to transfer
    function addKarmaTo(uint256 _tokenId, uint256 _amount) public {
        address ownerAddress = ownerOf(_tokenId);
        karma.transferFrom(_msgSender(), ownerAddress, _amount);
        content[_tokenId].karma += _amount;
    }

    /// @notice Sets the price of a given NFT
    /// @param _tokenId The ID of the NFT
    /// @param _amount The new price
    /// @dev Only the owner of the token may call this function
    function setPrice(uint256 _tokenId, uint256 _amount) public {
        require(
            ownerOf(_tokenId) == _msgSender(),
            "Only the owner can set the price of content"
        );
        
        content[_tokenId].price = _amount;
    }

    /// @notice Transfers content to the msg sender
    /// @param _tokenId The ID of the NFT
    function buyContent(uint256 _tokenId) public {
        require(
            bytes(content[_tokenId].txt).length > 0,
            "Invalid tokenId provided"
        );

        address ownerAddress = ownerOf(_tokenId);
        karma.transferFrom(_msgSender(), ownerAddress, content[_tokenId].price);
        safeTransferFrom(ownerAddress, _msgSender(), _tokenId);
    }

    /// @notice Returns the version of the recipient
    function versionRecipient()
    external
    override
    view
    returns (string memory) {
        return "2.2.4";
    }

    /// @notice Function to retrieve forwarder
    /// @dev Needed here because both base classes define it
    function _msgSender() internal view override(Context, BaseRelayRecipient)
        returns (address) {
        return BaseRelayRecipient._msgSender();
    }

    /// @notice Function to retrieve data from forwarder
    /// @dev Needed here because both base classes define it
    function _msgData() internal view override(Context, BaseRelayRecipient)
        returns (bytes memory) {
        return BaseRelayRecipient._msgData();
    }
}
