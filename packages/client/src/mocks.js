/**
 *   Simple, common unit test mocks
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */

/**
 * Mock IPFS object
 */
const mockCid = 1232423;
const mockIpfs = {
  add: (file) => { return { cid: mockCid }; },
  cat: (cid) => [mockCid],
  lastAssignedCid: mockCid,
  initialize: () => {},
};

/**
 * Mock fitTestWidthToContainer (canvas not implemented in Jest)
 */
jest.mock('./common', () => {
  const originalModule = jest.requireActual('./common');
  return {
    __esModule: true,
    ...originalModule,
    fitTextWidthToContainer: jest.fn(() => {}),
    getFromIpfs: (ipfs, cid) => [cid],
    pingInfura: (api, args, data) => {
      return {
        json: () => {
          return { Hash: mockCid.toString() };
        },
      };
    },
  };
});

/**
 * Mock ResizeObserver (not implemented in Jest)
 */
class ResizeObserver {
  observe() { }
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

/**
 * Mock createObjectURL (not implemented in Jest)
 */
function createObjectURL() {
  return '';
}
window.URL.createObjectURL = createObjectURL;

export { mockIpfs };
