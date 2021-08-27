const { ethers } = require("hardhat");

async function main() {
    // We get the contract to deploy
    const GnosisSafeProxyFactory = await ethers.getContractFactory("GnosisSafeProxyFactory");
    const factory = await GnosisSafeProxyFactory.deploy();
  
    console.log("factory deployed to:", factory.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });