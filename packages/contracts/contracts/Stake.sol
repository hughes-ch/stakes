// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "./Search.sol";

/// @title Connection between two users
/// @author Chris Hughes
/// @dev Find more information here: https://github.com/hughes-ch/stakes
contract Stake is BaseRelayRecipient {
    using Search for address[];

    struct UserData {
        string name;
        string picture;
    }

    mapping(address => UserData) private userData;
    mapping(address => address[]) private stakes;
    mapping(address => uint) private incomingStakes;
    mapping(uint256 => bool) private usedNonces;

    event UserStaked(address from, address to);
    event UserUnstaked(address from, address to);

    /// @notice constructor
    /// @param _trustedForwarder GSN trusted forwarder
    constructor(address _trustedForwarder) {
        _setTrustedForwarder(_trustedForwarder);
    }

    /// @notice Create a connection from the msg.sender to the user
    /// @param _user The user to connect the msg.sender to
    function stakeUser(address _user) public {
        if (stakes[_msgSender()].indexOf(_user) == type(uint).max) {
            stakes[_msgSender()].push(_user);
            incomingStakes[_user]++;
            emit UserStaked(msg.sender, _user);
        }
    }

    /// @notice Removes a connection from the msg.sender to the user
    /// @param _user The user to disconnect
    /// @dev The outgoing stakes array remains the same length
    function unstakeUser(address _user) public {
        uint idx = stakes[_msgSender()].indexOf(_user);
        if (idx != type(uint).max) {
            stakes[_msgSender()][idx] = address(0);
            incomingStakes[_user]--;
            emit UserUnstaked(msg.sender, _user);
        }
    }

    /// @notice Finds the number of users staked to this account
    /// @param _user [address] Check the number of stakes of this user
    function getIncomingStakes(address _user) public view returns (uint) {
        return incomingStakes[_user];
    }

    /// @notice Returns an array of users which this account is staked
    /// @param _user [address] The user to request
    function getOutgoingStakes(address _user)
        public
        view
        returns (address[] memory) {
        return stakes[_user];
    }

    /// @notice Sets user data
    /// @param _name The user's name
    /// @param _picture The user's picture (CID)
    function updateUserData(string memory _name, string memory _picture)
        external {
        userData[_msgSender()].name = _name;
        userData[_msgSender()].picture = _picture;
    }

    /// @notice Get user name
    /// @param _user The user to lookup
    /// @dev "Visiting" users will be provided empty information
    function getUserName(address _user) 
        external view returns (string memory) {
        return userData[_user].name;
    }

    /// @notice Get user pic CID
    /// @param _user The user to lookup
    /// @dev "Visiting" users will be provided empty information
    function getUserPic(address _user) 
        external view returns (string memory) {
        return userData[_user].picture;
    }

    /// @notice Returns the version of the recipient
    function versionRecipient()
    external
    override
    view
    returns (string memory) {
        return "2.2.4";
    }
}
