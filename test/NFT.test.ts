import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { I_AM_UKRAINIAN } from "../typechain-types";
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", function () {
  async function deployNFTFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const NFTFactory = await ethers.getContractFactory("I_AM_UKRAINIAN");
    const nft: I_AM_UKRAINIAN = await NFTFactory.deploy();

    await nft.deployed();

    return { nft, owner, otherAccount };
  }

  it("should be deployed", async function () {
    const { nft, owner } = await loadFixture(deployNFTFixture);

    const supply = await nft.totalSupply();
    const contractURI = await nft.contractURI();
    const token1URI = await nft.tokenURI(0);
    const bal = await nft.balanceOf(owner.address);
    const onerOfToken = await nft.ownerOf(0);
    const ownerOfContract = await nft.owner();

    expect(supply).to.eq(10000);
    expect(nft.address).to.be.properAddress;
    expect(contractURI).to.eq(
      "ipfs://QmeRMfUzVGjjsPTpBYRdnZfjSQ6u3N6vdDi2LSpVdELJsA"
    );
    expect(token1URI).to.eq(
      "ipfs://QmVht4TEniKhc2XPDhZw4SVv9K8WdyCzdRHGF761mjUFdg/1.json"
    );
    expect(bal).to.eq(10000);
    expect(onerOfToken).to.eq(owner.address);
    expect(ownerOfContract).to.eq(owner.address);
    console.log("address is valid");
  });

  it("approve nft", async function () {
    const { nft, owner, otherAccount } = await loadFixture(deployNFTFixture);

    const approveTx = await nft.approve(otherAccount.address, 1);

    await expect(approveTx)
      .to.emit(nft, "Approval")
      .withArgs(owner.address, otherAccount.address, 1);

    const getApproveTx = await nft.getApproved(1);

    expect(getApproveTx).to.eq(otherAccount.address);

    //reverts
    await expect(
      nft.connect(otherAccount).approve(otherAccount.address, 1)
    ).to.be.revertedWith(
      "ERC721: approve caller is not token owner or approved for all"
    );
  });

  it("approve all nft", async function () {
    const { nft, owner, otherAccount } = await loadFixture(deployNFTFixture);

    const approveAllTx = await nft.setApprovalForAll(
      otherAccount.address,
      true
    );

    await expect(approveAllTx)
      .to.emit(nft, "ApprovalForAll")
      .withArgs(owner.address, otherAccount.address, true);

    const getApproveAllTx = await nft.isApprovedForAll(
      owner.address,
      otherAccount.address
    );

    expect(getApproveAllTx).to.eq(true);
  });

  it("transfer nft", async function () {
    const { nft, owner, otherAccount } = await loadFixture(deployNFTFixture);

    // await nft.approve(otherAccount.address, 1);

    const transferTx = await nft["safeTransferFrom(address,address,uint256)"](
      owner.address,
      otherAccount.address,
      1
    );

    await expect(transferTx)
      .to.emit(nft, "Transfer")
      .withArgs(owner.address, otherAccount.address, 1);

    const balanceOwner = await nft.balanceOf(owner.address);
    const balanceotherAccount = await nft.balanceOf(otherAccount.address);

    const onerOfToken = await nft.ownerOf(1);

    expect(balanceOwner).to.eq(9999);
    expect(balanceotherAccount).to.eq(1);
    expect(onerOfToken).to.eq(otherAccount.address);

    //reverts
    await expect(
      nft
        .connect(otherAccount)
        ["safeTransferFrom(address,address,uint256)"](
          owner.address,
          otherAccount.address,
          1
        )
    ).to.be.revertedWith("ERC721: transfer from incorrect owner");
  });

  it("transfer from nft", async function () {
    const { nft, owner, otherAccount } = await loadFixture(deployNFTFixture);

    // await nft.approve(otherAccount.address, 1);
    await nft.setApprovalForAll(otherAccount.address, true);

    const transferTx = await nft
      .connect(otherAccount)
      ["safeTransferFrom(address,address,uint256)"](
        owner.address,
        otherAccount.address,
        1
      );

    await expect(transferTx)
      .to.emit(nft, "Transfer")
      .withArgs(owner.address, otherAccount.address, 1);

    const balanceOwner = await nft.balanceOf(owner.address);
    const balanceotherAccount = await nft.balanceOf(otherAccount.address);

    const onerOfToken = await nft.ownerOf(1);

    expect(balanceOwner).to.eq(9999);
    expect(balanceotherAccount).to.eq(1);
    expect(onerOfToken).to.eq(otherAccount.address);
  });

  it("change URIs", async function () {
    const { nft, owner, otherAccount } = await loadFixture(deployNFTFixture);

    const newUri = "newUri";
    const newContractUri = "newContractUri";

    await nft.changeBaseURI(newUri);
    await nft.changeBaseContractURI(newContractUri);

    const contractURI = await nft.contractURI();
    const token1URI = await nft.tokenURI(0);

    expect(contractURI).to.eq(newContractUri);
    expect(token1URI).to.eq(`${newUri}1.json`);

    //reverts
    await expect(
      nft.connect(otherAccount).changeBaseURI(newUri)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(
      nft.connect(otherAccount).changeBaseContractURI(newContractUri)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("post mint", async function () {
    const { nft, owner, otherAccount } = await loadFixture(deployNFTFixture);
    const address0 = "0x0000000000000000000000000000000000000000";
    const totalSupplyBefore = await nft.totalSupply();
    const numToMint = 521;

    const mintTx = await nft.safeMint(otherAccount.address, numToMint);

    // const receipt = await mintTx.wait();

    // if (receipt.events) {
    //   for (const event of receipt.events) {
    //     console.log(`Event ${event.event} with args ${event.args}`);
    //   }
    // }

    await expect(mintTx)
      .to.emit(nft, "Transfer")
      .withArgs(
        address0,
        otherAccount.address,
        totalSupplyBefore.toNumber() + numToMint - 1
      );

    const balanceotherAccount = await nft.balanceOf(otherAccount.address);
    const totalSupplyAfter = await nft.totalSupply();

    expect(balanceotherAccount).to.eq(numToMint);
    expect(totalSupplyAfter).to.eq(totalSupplyBefore.toNumber() + numToMint);

    //reverts
    await expect(
      nft.connect(otherAccount).safeMint(otherAccount.address, numToMint)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
