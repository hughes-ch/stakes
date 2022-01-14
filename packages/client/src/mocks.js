/**
 *   Simple, common unit test mocks
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */

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

/**
 * Mock IPFS object
 */
const mockCid = 1232423;
const mockIpfs = {
  add: (file) => { return { cid: mockCid }; },
  cat: (cid) => [mockCid],
  lastAssignedCid: mockCid,
};

export { mockIpfs };
