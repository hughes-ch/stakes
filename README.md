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

Stakes leverages code splitting due to the (sometimes) slow nature of IPFS and the large size of the IPFS and @truffle/contracts
