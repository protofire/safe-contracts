const { ethers } = require("hardhat");

async function main() {
    // We get the contract to deploy
    const SimulateTxAccessor = await ethers.getContractFactory("SimulateTxAccessor");
    const accessors = await SimulateTxAccessor.deploy();
  
    console.log("accessors deployed to:", accessors.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });