import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";

task("test", "Runs mocha tests").setAction(async (_, hre, superRun) => {
    if (hre.network.zksync) {
        console.log("TODO: implement zk tests");
        process.exit(1);
    } else {
        await superRun();
    }
});

export {};
