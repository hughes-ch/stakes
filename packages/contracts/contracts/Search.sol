// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Searches an array and returns the index (or uint max if not found)
/// @author Chris Hughes
library Search {
    function indexOf(address[] memory self, address value)
        public
        pure
        returns (uint)
    {
        for (uint ii = 0; ii < self.length; ii++) {
            if (self[ii] == value) {
                return ii;
            }
        }
        return type(uint).max;
    }
}
