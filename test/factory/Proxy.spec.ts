import { expect } from "chai";
import "@nomiclabs/hardhat-ethers";
import { AddressZero } from "@ethersproject/constants";
import { getContractFactoryByName } from "../utils/setup";

describe("Proxy", async () => {
    describe("constructor", async () => {
        it("should revert with invalid singleton address", async () => {
            const Proxy = await getContractFactoryByName("SafeProxy");
            await expect(Proxy.deploy(AddressZero)).to.be.revertedWith("Invalid singleton address provided");
        });
    });
});
