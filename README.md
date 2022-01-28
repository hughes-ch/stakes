<h1 align="center">
    <img width="100" height="100" src="packages/client/public/logo192.png" alt=""><br>
    Stakes
</h1>

The high-stakes social media app powered by IPFS and the Ethereum blockchain.

Users must buy into the app by purchasing the ERC20 Karma token. From there, all transactions are paid for with this token instead of the user's ETH balance. Users can post content, follow others, and support their favorite content by adding Karma to it. If they like a piece of content enough, they can outright buy it from another so it is added to their own collection. The best part is that content isn't limited to this platform. Since content is a full ERC721 token, it can be traded in any NFT marketplace. 

Stakes is currently hosted (and is always planned to be hosted) on the Rinkeby test network. See it [here](https://stakes.chrishughesdev.com)!

## Using Stakes
Logging in with a Metamask account:

https://user-images.githubusercontent.com/17994407/151448894-77197ec4-5078-488e-87de-2ba99b82f06a.mp4

"Staking" a user:

https://user-images.githubusercontent.com/17994407/151448939-f1c468c5-0922-449c-9881-e93a73f696e0.mp4

Purchasing content from a user:

https://user-images.githubusercontent.com/17994407/151448984-438f2bc0-18e6-4e9e-a2aa-d8111eb04376.mp4

## Technical Overview
Stakes uses the yarn package manager to handle installation and workspaces. There are two workspaces, both can be deployed individually:
1. The React frontend (client package)
2. The Solidity backend (contracts package)

### React Frontend
The React frontend is a create-react-app project that's been integrated with [Truffle Contracts](https://github.com/trufflesuite/truffle/tree/develop/packages/contract) and [js-ipfs](https://github.com/ipfs/js-ipfs). Apart from those two modules, it's a pretty standard React app that leverages react-router so it can be used as a single page application. 

Each component is given access to two contexts:
1. The Web3Context
2. The IpfsContext

The Web3Context serves as an interface to the web3js provider, contains information about the currently connected Metamask account, and provides an interface to the Solidity contracts through @truffle/contract. This context is setup as soon as a client selects the "Connect" button on the public index page. 

When a client selects "Connect," an IPFS instance is also started in their browser. Stakes uses IPFS to store user pictures. The actual text content of their posts and the IPFS address of their images are stored on the Ethereum blockchain. When the application needs to fetch a user image, it first needs to retrieve the CID from the chain, and then it needs to retrieve the image from the IPFS network. The IpfsContext provides the interface for the second step. As an aside: user image uploads are sent directly to Infura's IPFS interface to prevent images from being pinned on a local IPFS node which then shuts down as soon as the browser is closed. This ensures that images are as readily-available as possible on the IPFS network.

At the top level of the application (in the App component), an Authenticator component verifies that the Web3Context is setup and associated with a valid Metamask account. If this is the case, it allows routing to the "protected" paths (anything that isn't the public page). Otherwise, it routes back to the public page.

The React front end is accessed through IPFS. If you have IPFS enabled in your browser, it can be accessed through ipns://stakes.chrishughesdev.com. Otherwise, it is served through a gateway provided by dweb.link. 

To minimize the amount of content that IPFS must send for each URL, Stakes leverages code splitting. This is mostly to break apart the large file sizes of the @truffle/contract and js-ipfs modules. The public page can be delivered (relatively) quickly while the rest of the functionality can be delivered piecemeal once the user actually logs in. 

### Solidity Backend
As hinted at earlier, the Solidity backend is built with Truffle. 

There are four main contracts keeping state of the application:

#### Karma
The Karma token is an ERC20 token used for all transactions in the application. On-chain 1 Karma === 1 Wei, though users are shown a scaled (and rounded) amount on the frontend. 

Stakes uses the [OpenGSN](https://opengsn.org/) project to allow paying for transactions in its native token instead of ETH. The method for doing so is fairly straightforward. Whenever a new user joins the application, they must buy Karma with an ETH balance. This ETH then pays for all of the gas fees associated with creating new posts and adding Karma to other pieces of content. Theoretically, one might never have to pay for Karma (or gas) again if enough other users enjoy their content.

The Karma contract is an adaptation of OpenZeppelin's ERC20 token implementation.

#### KarmaPaymaster
The KarmaPaymaster is the interface between the Karma contract and OpenGSN. It trades Karma for ETH to both users and the OpenGSN network so that the users can interact with the Blockchain and OpenGSN gets its fair share of ETH for providing the transactions. 

#### Content
The Content contract maintains user content as NFTs using OpenZeppelin's ERC721 standard. 

#### Stake
The Stake contract maintains connections between different users. It also maintains information about individual users and allows searching based on name and address. 

## Contributing
This project served as a great learning experience, but is not going to be supported going forward.

However, here are steps to contribute if needed:

### Setting up environment
The first thing to do is to setup yarn berry (without pnp) and install. 

Two .env files are needed. One at the top of each workspace:

    # contracts
    INFURA_API_KEY=<key>
    MNEMONIC=<mnemonic>

    # client
    REACT_APP_INFURA_PROJECT_ID=<proj_id>
    REACT_APP_INFURA_PROJECT_SECRET=<secret>
    
### Working with @stakes/contracts
#### Testing
Testing @stakes/contracts is fairly straightforward. Just type:

    yarn workspace @stakes/contracts test
    
Yarn will then run each unit test. Note that unit tests are fairly slow, as the OpenGSN network and the truffle local blockchain need to be restarted between each test suite. Unit tests are written in Mocha and Chai. 

To run a single test, find the test definition in the Javascript test file and change the first line of the test definition to:

    it.only
    
The test script will indicate that it will only run the test case containing that test.

#### Deploying
To deploy the contracts, type 

    yarn workspace @stakes/contracts truffle migrate --network rinkeby

### Testing @stakes/client
#### Testing
Testing @stakes/client is also easy. Just type:

    yarn workspace @stakes/client test

Yarn will then run each unit test. Note that unit tests are fairly slow, as the OpenGSN network and the truffle local blockchain need to be restarted between each test suite. Unit tests are written with Jest.

Before a deployment, it's worthwhile to build the production frontend and test it against a local network. 

To start the production build, type: 

    >> cd packages/client
    >> yarn build && yarn serve -s build

To start the blockchain, navigate back to the root of the project and type:

    >> yarn workspace @stakes/contracts truffle dev &
    >> yarn workspace @stakes/contracts gsn-start
    >> yarn workspace @stakes/contracts truffle migrate --network test
    
#### Deploying
Once the production build has been tested it will need to be added to IPFS. [See here](https://docs.ipfs.io/how-to/command-line-quick-start/) for directions on how to install the IPFS CLI. 

First, start the IPFS daemon:

    >> ipfs daemon &
    
Then, add the build directory to the local IPFS node:

    >> cd packages/client
    >> ipfs add -r build --cid-version 1
    
Then, pin the resulting CID to Infura so it's available even when the local node is unavailable:

    >> curl -X POST -u "<proj_id>:<proj_secret>" "https://ipfs.infura.io:5001/api/v0/pin/add?arg=<cid>"
    
This curl command may take a few attempts if the ipfs daemon was just started. It will have the most success if it can run for ten minutes or more to locate enough peers to connect with Infura. If that still doesn't work, [see here](https://docs.ipfs.io/how-to/nat-configuration/) for steps on how to troubleshoot IPFS. 
