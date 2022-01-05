const { ethers } = require("hardhat");

async function main() {
    // We get the contract to deploy
    const DefaultCallbackHandler = await ethers.getContractFactory("DefaultCallbackHandler");
    const CompatibilityFallbackHandler = await ethers.getContractFactory("CompatibilityFallbackHandler");
    const handlers = await DefaultCallbackHandler.deploy();
    const fallback_handlers = await CompatibilityFallbackHandler.deploy();
  
    console.log("handlers deployed to:", handlers.address);
    console.log("fallback_handlers deployed to:", fallback_handlers.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });