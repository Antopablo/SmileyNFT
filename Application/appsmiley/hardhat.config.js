require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.12",
  paths: {
    artifacts: './artifacts'
  },
  networks: {
    hardhat: {
      chainId: 1377
    }
  }
};
