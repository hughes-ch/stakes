// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Token used to buy and support content
/// @author Chris Hughes
contract Karma is ERC20, Ownable {

    address private minter;

    /// @notice Constructor
    constructor() ERC20("Karma", "KARMA") {
    }

    /// @notice Sets minter
    function setMinter(address _minter) public onlyOwner {
        require(_minter != address(0));
        minter = _minter;
    }

    /// @notice Adds to the user's KARMA balance
    /// @dev Only the minter can call this - set at construction time
    function mint(address to, uint256 amount) payable public {
        require(msg.sender == minter, "Only the minter can mint Karma");
        require(amount > 0, "Amount must be more than 0");
        _mint(to, amount);
    }

    /// @notice Removes tokens from the user's KARMA balance
    /// @dev Only the minter can call this - set at construction time
    function burn(address from, uint256 amount) public {
        require(msg.sender == minter, "Only the minter can burn karma");
        require(amount > 0, "Amount must be more than 0");
        _burn(from, amount);
    }
}
