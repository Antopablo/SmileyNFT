require("@nomicfoundation/hardhat-toolbox");

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
