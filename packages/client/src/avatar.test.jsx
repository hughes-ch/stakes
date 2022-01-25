/**
 *   Tests for the Avatar component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import { mockIpfs } from './mocks';
import Avatar from './avatar';
import config from './config';
import { connectToLocalBlockChain,
         getReasonablySizedName,
         stopLocalBlockChain } from './common';
import IpfsContext from './ipfs-context';
import { render, screen, waitFor } from '@testing-library/react';
import Web3Context from './web3-context';

let web3Context;

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();
}, config.UNIT_TEST_SETUP_TIMEOUT);

afterAll(() => {
  stopLocalBlockChain();
}); 

describe('the Avatar component', () => {
  it('renders a default picture', async () => {
    render(
      <IpfsContext.Provider value={ mockIpfs }>
        <Web3Context.Provider value={ web3Context }>
          <Avatar user={ web3Context.activeAccount }/>
        </Web3Context.Provider>
      </IpfsContext.Provider>
    );

    const img = screen.getByRole('img');
    await waitFor(
      () => expect(img.src).toMatch(new RegExp(config.DEFAULT_USER_PIC_URL))
    );
  });

  it('renders a default username', async () => {
    render(
      <IpfsContext.Provider value={ mockIpfs }>
        <Web3Context.Provider value={ web3Context }>
          <Avatar user={ web3Context.activeAccount }/>
        </Web3Context.Provider>
      </IpfsContext.Provider>
    );

    const myAccount = getReasonablySizedName(web3Context.activeAccount);
    expect(await screen.findByText(myAccount)).toBeInTheDocument();
  });

  it('renders the username and pic from the blockchain', async () => {
    const pic = new File(["pic"], "pic.jpg", { type: "image/jpg" });
    const { cid } = await mockIpfs.add(pic);
    const myName = 'name';
    await web3Context.contracts.stake.updateUserData(
      myName, cid.toString(), 'image/jpg', { from: web3Context.activeAccount }
    );

    render(
      <IpfsContext.Provider value={ mockIpfs }>
        <Web3Context.Provider value={ web3Context }>
          <Avatar user={ web3Context.activeAccount }/>
        </Web3Context.Provider>
      </IpfsContext.Provider>
    );

    expect(await screen.findByText(myName)).toBeInTheDocument();
    const imgSrc = screen.getByRole('img').src;
    expect(imgSrc).not.toMatch(new RegExp(config.DEFAULT_USER_PIC_URL));
    expect(imgSrc).not.toBeFalsy();
  });
});

