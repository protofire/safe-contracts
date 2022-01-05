const { ethers } = require("hardhat");

async function main() {
    // We get the contract to deploy
    const GnosisSafe = await ethers.getContractFactory("GnosisSafe");    
    const singleton = await GnosisSafe.deploy();
  
    console.log("singleton deployed to:", singleton.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });