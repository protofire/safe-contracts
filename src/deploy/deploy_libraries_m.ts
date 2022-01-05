const { ethers } = require("hardhat");

async function main() {
    // We get the contract to deploy
    const CreateCall = await ethers.getContractFactory("CreateCall");
    const MultiSend = await ethers.getContractFactory("MultiSend");
    const MultiSendCallOnly = await ethers.getContractFactory("MultiSendCallOnly");
    
    const libraries_call = await CreateCall.deploy();
    const libraries_send = await MultiSend.deploy();
    const libraries_sendOnly = await MultiSendCallOnly.deploy();
  
    console.log("libraries_call deployed to:", libraries_call.address);
    console.log("libraries_send deployed to:", libraries_send.address);
    console.log("libraries_sendOnly deployed to:", libraries_sendOnly.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });