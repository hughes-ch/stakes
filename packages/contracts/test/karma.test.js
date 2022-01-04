/**
 *   Tests for the Karma contract
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const Karma = artifacts.require("Karma");

let karmaInstance

contract('Karma', (accounts) => {
  beforeEach(async () => {
    karmaInstance = await Karma.new();
  });
  
  it('should be purchase-able by the user', async () => {
    expect(false).to.equal(true);
  });

  // Update these tests
});
