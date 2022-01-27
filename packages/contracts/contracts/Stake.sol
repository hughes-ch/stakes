// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./Array.sol";
import "./String.sol";

/// @title Connection between two users
/// @author Chris Hughes
/// @dev Find more information here: https://github.com/hughes-ch/stakes
contract Stake is BaseRelayRecipient {
    using EnumerableSet for EnumerableSet.AddressSet;
    using Array for address[];
    using String for string;

    struct UserData {
        string name;
        string picture;
        string filetype;
    }

    mapping(address => UserData) private userData;
    mapping(address => address[]) private stakes;
    mapping(address => uint) private incomingStakes;
    mapping(bytes => EnumerableSet.AddressSet) private searchAssociations;

    event UserStaked(address from, address to);
    event UserUnstaked(address from, address to);
    event SearchAssociation(bytes key, address to);
    event UpdateUserData(string name, string picture, string filetype);

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
        returns (address[] memory outgoingStakes) {
        for (uint ii = 0; ii < stakes[_user].length; ii++) {
            if (stakes[_user][ii] != address(0)) {
                outgoingStakes = outgoingStakes.append(stakes[_user][ii]);
            }
        }
    }

    /// @notice Sets user data
    /// @param _name The user's name
    /// @param _picture The user's picture (CID)
    /// @param _filetype The associated picture's filetype (e.g. image/jpg)
    function updateUserData(
        string memory _name,
        string memory _picture,
        string memory _filetype
    ) external {
        // Remove previous name from searchAssociations container
        if (bytes(userData[_msgSender()].name).length > 0) {
            bytes[] memory currentSplitName = userData[_msgSender()].name.split();
            for (uint ii = 0; ii < currentSplitName.length; ii++) {
                bytes memory key = currentSplitName[ii];
                if (key.length == 0) {
                    continue;
                }
                
                if (searchAssociations[key].contains(_msgSender())) {
                    searchAssociations[key].remove(_msgSender());
                }
            }
        }

        // Update name and picture to newly requested
        userData[_msgSender()].name = _name;
        userData[_msgSender()].picture = _picture;
        userData[_msgSender()].filetype = _filetype;
        emit UpdateUserData(_name, _picture, _filetype);
        
        // Add new name to searchAssociations container
        bytes[] memory newSplitName = _name.split();
        for (uint ii = 0; ii < newSplitName.length; ii++) {
            if (newSplitName[ii].length == 0) {
                continue;
            }

            searchAssociations[newSplitName[ii]].add(_msgSender());
            emit SearchAssociation(newSplitName[ii], _msgSender());
        }
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
        external view returns (string memory, string memory) {
        return (userData[_user].picture, userData[_user].filetype);
    }

    /// @notice Returns whether the user has connected to the contract
    /// @param _address Query string
    function userHasConnected(address _address)
        external
        view
        returns (bool) {
        return stakes[_address].length > 0;
    }

    /// @notice Search for users based on a query string
    /// @param _query Query string
    /// @param _page Search result page number
    /// @param _numPerPage Which page number to return
    function searchForUserName(string memory _query, uint _page, uint _numPerPage)
        external
        view
        returns (address[] memory) {
        uint maxResultCount = 100;
        uint limitedNumPerPage = _numPerPage > maxResultCount ?
            maxResultCount : _numPerPage;

        address[] memory results = new address[](limitedNumPerPage);
        
        uint pageNum = 0;
        uint countOnThisPage = 0;
        bytes[] memory splitQuery = _query.split();
        if (splitQuery.length == 0) {
            return new address[](limitedNumPerPage);
        }
        
        address[] memory candidates = findSearchCandidates(splitQuery[0]);
        for (uint ii = 0; ii < candidates.length; ii++) {
            bool isCandidate = true;
            for (uint jj = 1; jj < splitQuery.length; jj++) {
                address[] memory nextQueryCandidates = findSearchCandidates(
                    splitQuery[jj]
                );
                
                if (nextQueryCandidates.indexOf(candidates[ii]) == type(uint).max) {
                    isCandidate = false;
                    break;
                }
            }

            if (isCandidate) {
                if (pageNum == _page) {
                    results[countOnThisPage] = candidates[ii];
                }

                countOnThisPage = (++countOnThisPage) % limitedNumPerPage;
                pageNum = countOnThisPage == 0 ? pageNum + 1 : pageNum;
                if (pageNum > _page) {
                    return results;
                }
            }
        }

        return pageNum == _page ? results : new address[](0);
    }

    /// @notice Find addresses in searchAssociations that match query
    /// @param _query Single string to query
    function findSearchCandidates(bytes memory _query)
        internal
        view
        returns (address[] memory) {
        if (_query.length == 0 || searchAssociations[_query].length() == 0) {
            return new address[](0);
        }
        
        return searchAssociations[_query].values();
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
