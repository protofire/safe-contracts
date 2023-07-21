import { ethers, Contract, BigNumberish } from "ethers";
import hre from "hardhat";
import * as zk from "zksync-web3";

export const calculateProxyAddress = async (factory: Contract, singleton: string, inititalizer: string, nonce: number | string) => {
    const salt = ethers.utils.solidityKeccak256(["bytes32", "uint256"], [ethers.utils.solidityKeccak256(["bytes"], [inititalizer]), nonce]);

    if (hre.network.zksync) {
        const proxyCreationCode = (await hre.artifacts.readArtifact("SafeProxy")).deployedBytecode;
        const bytecodehash = zk.utils.hashBytecode(proxyCreationCode);
        const input = new ethers.utils.AbiCoder().encode(["address"], [singleton]);
        return zk.utils.create2Address(factory.address, bytecodehash, salt, input);
    }

    const deploymentCode = ethers.utils.solidityPack(["bytes", "uint256"], [await factory.proxyCreationCode(), singleton]);
    return ethers.utils.getCreate2Address(factory.address, salt, ethers.utils.keccak256(deploymentCode));
};

export const calculateProxyAddressWithCallback = async (
    factory: Contract,
    singleton: string,
    inititalizer: string,
    nonce: number | string,
    callback: string,
) => {
    const saltNonceWithCallback = ethers.utils.solidityKeccak256(["uint256", "address"], [nonce, callback]);
    return calculateProxyAddress(factory, singleton, inititalizer, saltNonceWithCallback);
};

export const calculateChainSpecificProxyAddress = async (
    factory: Contract,
    singleton: string,
    inititalizer: string,
    nonce: number | string,
    chainId: BigNumberish,
) => {
    const salt = ethers.utils.solidityKeccak256(
        ["bytes32", "uint256", "uint256"],
        [ethers.utils.solidityKeccak256(["bytes"], [inititalizer]), nonce, chainId],
    );

    if (hre.network.zksync) {
        const proxyCreationCode = (await hre.artifacts.readArtifact("SafeProxy")).deployedBytecode;
        const bytecodehash = zk.utils.hashBytecode(proxyCreationCode);
        const input = new ethers.utils.AbiCoder().encode(["address"], [singleton]);
        return zk.utils.create2Address(factory.address, bytecodehash, salt, input);
    }

    const deploymentCode = ethers.utils.solidityPack(["bytes", "uint256"], [await factory.proxyCreationCode(), singleton]);
    return ethers.utils.getCreate2Address(factory.address, salt, ethers.utils.keccak256(deploymentCode));
};
