import { ethers } from "hardhat";

async function main() {
  const NFTFactory = await ethers.getContractFactory("I_AM_UKRAINIAN");
  const NFT = await NFTFactory.deploy();

  await NFT.deployed();

  console.log(`deployed to ${NFT.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
