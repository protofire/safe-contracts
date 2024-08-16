import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
const { ethers } = require("ethers");

const deploy: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  const baseFeeHex = "0xe9c0154780";
  const baseFeePerGas = ethers.BigNumber.from(baseFeeHex);
  const maxPriorityFeePerGas = ethers.utils.parseUnits("2", "gwei"); // 2 Gwei
  const maxFeePerGas = baseFeePerGas.add(maxPriorityFeePerGas);

  await deploy("SimulateTxAccessor", {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: true,
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas,
  });
};

deploy.tags = ['accessors', 'l2-suite', 'main-suite']
export default deploy;
