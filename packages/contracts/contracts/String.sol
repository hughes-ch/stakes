// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Common functions for strings
/// @author Chris Hughes
library String {
    /// @notice Splits a string when encountering whitespace and returns array
    /// @param self The string to split
    /// @dev Note that the returned string is in bytes
    function split(string memory self)
    public
    pure
    returns (bytes[] memory) {
        bytes memory inBytes = bytes(self);
        bytes[] memory splitString = new bytes[](inBytes.length);
        uint splitStringIdx = 0;

        uint startOfSlice = 0;
        for (uint ii = 0; ii < inBytes.length; ii++) {
            uint endOfSlice = (
                inBytes[ii] == 0x20 ? ii : (
                    ii == inBytes.length - 1 ? inBytes.length : startOfSlice));

            if (endOfSlice != startOfSlice) {
                splitString[splitStringIdx] = slice(
                    inBytes, startOfSlice, endOfSlice
                );
                splitStringIdx++;
                startOfSlice = ii + 1;
            }
        }
        
        return trim(splitString);
    }

    /// @notice Internal function to return a piece of bytes
    /// @param _bytes The bytes to slice
    /// @param _start The start of the slice (inclusive)
    /// @param _end The end of the slice (exclusive)
    function slice(bytes memory _bytes, uint _start, uint _end)
    internal
    pure
    returns (bytes memory _sliced) {
        for (uint ii = _start; ii < _end; ii++) {
            _sliced = bytes.concat(_sliced, _bytes[ii]);
        }
    }

    /// @notice Removes default values from back of array
    /// @param _array Array to trim
    function trim(bytes[] memory _array)
        internal
        pure
        returns (bytes[] memory) {
        uint ii;
        for (ii = 0; ii < _array.length; ii++) {
            if (_array[ii].length == 0) {
                break;
            }
        }
        
        bytes[] memory trimmedArray = new bytes[](ii);
        for (uint jj = 0; jj < trimmedArray.length; jj++) {
            trimmedArray[jj] = _array[jj];
        }
        
        return trimmedArray;
    }
}
