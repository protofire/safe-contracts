const { ethers } = require("hardhat");

async function main() {
    // We get the contract to deploy
    const GnosisSafeL2 = await ethers.getContractFactory("GnosisSafeL2");    
    const deployer = await GnosisSafeL2.deploy();
  
    console.log("deployer deployed to:", deployer.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });