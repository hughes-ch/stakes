// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Search.sol";

/// @title Connection between two users
/// @author Chris Hughes
/// @dev Find more information here: https://github.com/hughes-ch/stakes
contract Stake {
    using Search for address[];
    
    mapping(address => address[]) private _stakes;
    mapping(address => uint) private _incomingStakes;

    /// @notice Create a connection from the msg.sender to the user
    /// @param _user The user to connect the msg.sender to
    function stakeUser(address _user) public {
        if (_stakes[msg.sender].indexOf(_user) == type(uint).max) {
            _stakes[msg.sender].push(_user);
            _incomingStakes[_user]++;
        }
    }

    /// @notice Removes a connection from the msg.sender to the user
    /// @param _user The user to disconnect
    /// @dev The outgoing stakes array remains the same length
    function unstakeUser(address _user) public {
        uint idx = _stakes[msg.sender].indexOf(_user);
        if (idx != type(uint).max) {
            _stakes[msg.sender][idx] = address(0);
            _incomingStakes[_user]--;
        }
    }

    /// @notice Finds the number of users staked to this account
    /// @param _user [address] Check the number of stakes of this user
    function getIncomingStakes(address _user) public view returns (uint) {
        return _incomingStakes[_user];
    }

    /// @notice Returns an array of users which this account is staked
    function getOutgoingStakes() public view returns (address[] memory) {
        return _stakes[msg.sender];
    }
}
