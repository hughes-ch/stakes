// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Token used to buy and support content
/// @author Chris Hughes
contract Karma is ERC20 {

    /// @notice Constructor
    constructor() ERC20("Karma", "KARMA") {}

    /// @notice Adds to the user's KARMA balance
    function buyKarma() payable public {
        uint256 amountToBuy = msg.value;
        require(amountToBuy > 0);
        _mint(msg.sender, amountToBuy);
    }
}
