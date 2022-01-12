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
export default ResizeObserver;
