import hre, { deployments, waffle } from "hardhat";
import { Wallet, Contract, ethers } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import solc from "solc";
import * as zk from "zksync-web3";
import { logGas } from "../../src/utils/execution";
import { safeContractUnderTest } from "./config";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { getZkContractFactoryByName, zkCompile } from "./zk";
import { getRandomIntAsString } from "./numbers";

export const defaultTokenCallbackHandlerDeployment = async () => {
    return await deployments.get("TokenCallbackHandler");
};

export const defaultTokenCallbackHandlerContract = async () => {
    return await hre.ethers.getContractFactory("TokenCallbackHandler");
};

export const compatFallbackHandlerDeployment = async () => {
    return await deployments.get("CompatibilityFallbackHandler");
};

export const compatFallbackHandlerContract = async () => {
    return await hre.ethers.getContractFactory("CompatibilityFallbackHandler");
};

export const getSafeSingleton = async () => {
    const SafeDeployment = await deployments.get(safeContractUnderTest());
    const Safe = await hre.ethers.getContractFactory(safeContractUnderTest());
    return Safe.attach(SafeDeployment.address);
};

export const getSafeSingletonContract = async () => {
    const safeSingleton = await hre.ethers.getContractFactory(safeContractUnderTest());

    return safeSingleton;
};

export const getFactoryContract = async () => {
    const factory = await hre.ethers.getContractFactory("SafeProxyFactory");

    return factory;
};

export const getFactory = async () => {
    const FactoryDeployment = await deployments.get("SafeProxyFactory");
    const Factory = await hre.ethers.getContractFactory("SafeProxyFactory");
    return Factory.attach(FactoryDeployment.address);
};

export const getSimulateTxAccessor = async () => {
    const SimulateTxAccessorDeployment = await deployments.get("SimulateTxAccessor");
    const SimulateTxAccessor = await hre.ethers.getContractFactory("SimulateTxAccessor");
    return SimulateTxAccessor.attach(SimulateTxAccessorDeployment.address);
};

export const getMultiSend = async () => {
    const MultiSendDeployment = await deployments.get("MultiSend");
    const MultiSend = await hre.ethers.getContractFactory("MultiSend");
    return MultiSend.attach(MultiSendDeployment.address);
};

export const getMultiSendCallOnly = async () => {
    const MultiSendDeployment = await deployments.get("MultiSendCallOnly");
    const MultiSend = await hre.ethers.getContractFactory("MultiSendCallOnly");
    return MultiSend.attach(MultiSendDeployment.address);
};

export const getCreateCall = async () => {
    const CreateCallDeployment = await deployments.get("CreateCall");
    const CreateCall = await hre.ethers.getContractFactory("CreateCall");
    return CreateCall.attach(CreateCallDeployment.address);
};

export const migrationContract = async () => {
    return await hre.ethers.getContractFactory("Migration");
};

export const getMock = async () => {
    if (!hre.network.zksync) {
        const Mock = await hre.ethers.getContractFactory("MockContract");
        return Mock.deploy();
    } else {
        const deployer = new Deployer(hre, getWallets()[0] as zk.Wallet);
        const artifact = await deployer.loadArtifact("MockContract");
        const contract = await deployer.deploy(artifact);
        await contract.deployTransaction.wait();
        return contract;
    }
};

export const getContractFactoryByName = async (contractName: string) => {
    if (hre.network.zksync) {
        return getZkContractFactoryByName(hre, contractName, getWallets()[0] as zk.Wallet);
    } else {
        return hre.ethers.getContractFactory(contractName);
    }
};

export const getSafeTemplate = async (saltNumber: string = getRandomIntAsString()) => {
    const singleton = await getSafeSingleton();
    const factory = await getFactory();
    const template = await factory.callStatic.createProxyWithNonce(singleton.address, "0x", saltNumber);
    await factory.createProxyWithNonce(singleton.address, "0x", saltNumber).then((tx: any) => tx.wait());
    const Safe = await hre.ethers.getContractFactory(safeContractUnderTest());
    return Safe.attach(template);
};

export const getSafeWithOwners = async (
    owners: string[],
    threshold?: number,
    fallbackHandler?: string,
    logGasUsage?: boolean,
    saltNumber: string = getRandomIntAsString(),
) => {
    const template = await getSafeTemplate(saltNumber);
    await logGas(
        `Setup Safe with ${owners.length} owner(s)${fallbackHandler && fallbackHandler !== AddressZero ? " and fallback handler" : ""}`,
        template.setup(owners, threshold || owners.length, AddressZero, "0x", fallbackHandler || AddressZero, AddressZero, 0, AddressZero),
        !logGasUsage,
    );
    return template;
};

export const getTokenCallbackHandler = async () => {
    return (await defaultTokenCallbackHandlerContract()).attach((await defaultTokenCallbackHandlerDeployment()).address);
};

export const getCompatFallbackHandler = async () => {
    return (await compatFallbackHandlerContract()).attach((await compatFallbackHandlerDeployment()).address);
};

export const getSafeProxyRuntimeCode = async () => {
    const proxyArtifact = await hre.artifacts.readArtifact("SafeProxy");

    return proxyArtifact.deployedBytecode;
};

export const compile = async (source: string) => {
    const input = JSON.stringify({
        language: "Solidity",
        settings: {
            outputSelection: {
                "*": {
                    "*": ["abi", "evm.bytecode"],
                },
            },
        },
        sources: {
            "tmp.sol": {
                content: source,
            },
        },
    });
    const solcData = await solc.compile(input);
    const output = JSON.parse(solcData);
    if (!output["contracts"]) {
        console.log(output);
        throw Error("Could not compile contract");
    }
    const fileOutput = output["contracts"]["tmp.sol"];
    const contractOutput = fileOutput[Object.keys(fileOutput)[0]];
    const abi = contractOutput["abi"];
    const data = "0x" + contractOutput["evm"]["bytecode"]["object"];
    return {
        data: data,
        interface: abi,
    };
};

export const deployContract = async (deployer: Wallet, source: string): Promise<Contract> => {
    if (!hre.network.zksync) {
        const output = await compile(source);
        const transaction = await deployer.sendTransaction({ data: output.data, gasLimit: 6000000 });
        const receipt = await transaction.wait();
        return new Contract(receipt.contractAddress, output.interface, deployer);
    } else {
        const output = await zkCompile(hre, source);

        const factory = new zk.ContractFactory(output.abi, output.data, getWallets()[0] as zk.Wallet, "create");
        // Encode and send the deploy transaction providing factory dependencies.
        const contract = await factory.deploy();
        await contract.deployed();

        return contract;
    }
};

export const getWallets = (): (ethers.Wallet | zk.Wallet)[] => {
    if (hre.network.name === "hardhat") return waffle.provider.getWallets();
    if (!hre.network.zksync) throw new Error("You can get wallets only on Hardhat or ZkSyncLocal networks!");

    const { accounts } = hre.network.config;

    if (typeof accounts === "string") throw new Error("Unsupported accounts config");

    const zkProvider = zk.Provider.getDefaultProvider();
    if (Array.isArray(accounts)) {
        const wallets = [];

        for (const account of accounts) {
            if (typeof account === "string") {
                wallets.push(new zk.Wallet(account).connect(zkProvider));
            } else if (typeof account === "object" && "privateKey" in account) {
                wallets.push(new zk.Wallet(account.privateKey).connect(zkProvider));
            }
        }

        return wallets;
    } else {
        throw new Error("Unsupported accounts config");
    }
};
