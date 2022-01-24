/**
 *   Tests for the EditProfilePopup component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import "@testing-library/jest-dom";
import { mockIpfs } from "./mocks";
import { BrowserRouter as Router } from "react-router-dom";
import config from './config';
import { connectToLocalBlockChain, stopLocalBlockChain } from './common';
import IpfsContext from './ipfs-context';
import ProfilePage from './profile-page';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Web3Context from './web3-context';

/**
 * Global setup and teardown
 */
let mockUpdateData;
let web3Context;

beforeAll(async () => {
  web3Context = await connectToLocalBlockChain();
}, config.UNIT_TEST_SETUP_TIMEOUT);
beforeEach(async () => {
  mockUpdateData = jest.fn();
  web3Context.contracts.stake.updateUserData = mockUpdateData;
  render(
    <IpfsContext.Provider value={ mockIpfs }>
      <Web3Context.Provider value={ web3Context }>
        <Router>
          <ProfilePage/>
        </Router>
      </Web3Context.Provider>
    </IpfsContext.Provider>
  );
  
  const editProfileLink = await screen.findByTestId('edit-profile-link');
  editProfileLink.click();
});
afterEach(() => {
  jest.restoreAllMocks();
});
afterAll(() => {
  stopLocalBlockChain();
});

/**
 * Unit tests
 */
describe('The EditProfilePopup component', () => {
  it('can add a picture', async () => {
    const filetype = 'image/png';
    const file = new File(['userPic'], 'myPic.png', {type: filetype});
    const input = await screen.findByText('Select picture');
    await userEvent.upload(input, file);

    screen.getByText('Submit').click();

    await waitFor(
      () => expect(mockUpdateData).toHaveBeenCalledWith(
        config.DEFAULT_USER_NAME,
        mockIpfs.lastAssignedCid.toString(),
        filetype,
        { from: web3Context.activeAccount }
      )
    );
  });

  it('can add a new name', async () => {
    const newName = 'My Name';
    const input = await screen.findByLabelText('Introduce yourself:');
    await userEvent.clear(input);
    await userEvent.type(input, newName);

    await waitFor(() => expect(input).toHaveValue(newName));
    await waitFor(() => expect(screen.getByText('Submit')).toBeEnabled());
    screen.getByText('Submit').click();

    await waitFor(
      () => expect(mockUpdateData).toHaveBeenCalledWith(
        newName,
        '', '',
        { from: web3Context.activeAccount }
      )
    );
  });

  it('can be cancelled', async () => {
    const newName = 'My Name';
    const input = await screen.findByLabelText('Introduce yourself:');
    await userEvent.clear(input);
    await userEvent.type(input, newName);

    screen.getByText('Cancel').click();

    expect(mockUpdateData).not.toHaveBeenCalled();
  });

  it('does not allow empty names', async () => {
    const input = await screen.findByLabelText('Introduce yourself:');
    await userEvent.clear(input);
    await waitFor(() => expect(screen.getByText('Submit')).toBeDisabled());
  });
});
