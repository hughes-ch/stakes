// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Array utility library
/// @author Chris Hughes
/// @dev Makes arrays usable
library Array {
    /// @notice Searches an array and returns the index (or uint max if not found)
    /// @param self The array to search
    /// @param value The value to search for
    function indexOf(address[] memory self, address value)
        public
        pure
        returns (uint) {
        for (uint ii = 0; ii < self.length; ii++) {
            if (self[ii] == value) {
                return ii;
            }
        }
        return type(uint).max;
    }

    /// @notice Appends an element to an array and returns the new array
    /// @param self The "base" array
    /// @param element The element to append
    function append(address[] memory self, address element)
        public
        pure
        returns (address[] memory concattedArray) {
        concattedArray = new address[](self.length + 1);
        for (uint ii = 0; ii < self.length; ii++) {
            concattedArray[ii] = self[ii];
        }

        concattedArray[self.length] = element;
    }
}
