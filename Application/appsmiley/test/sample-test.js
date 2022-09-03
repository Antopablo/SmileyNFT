const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const chai = require("chai");
const { expect } = require("chai");
const tokens = require("../tokens.json");

describe("Tests Smiley ERC721A", function () {
    before(async function () {
        [this.owner, this.addr1, this.addr2, this.addr3, ...this.addres] = await ethers.getSigners();
        let tab = [];
        tokens.map((token) => {
            tab.push(token.address);
        });
        const leaves = tab.map((address) => keccak256(address));
        this.tree = new MerkleTree(leaves, keccak256, { sort: true });
        const root = this.tree.getHexRoot();

        this.merkleTreeRoot = root;
    })

    it('should deploy the smart contract', async function () {
        this.baseURI = "ipfs://CID/"
        this.contract = await hre.ethers.getContractFactory("SmileyERC721A");
        this.deployedContract = await this.contract.deploy(this.merkleTreeRoot, this.baseURI);
    })

    it('sellingStep should equal 0 after deploying the smart contract', async function () {
        expect(await this.deployedContract.sellingStep()).to.equal(0);
    })

    it('MerkleRoot length should be 66', async function () {
        expect(await this.deployedContract.merkleRoot()).to.have.lengthOf(66);
    })

    it("should NOT change the selling step if not the owner", async function () {
        await expect(this.deployedContract.connect(this.addr1).setStep(1)).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it("Sould set the set start time", async function () {
        let saleStartTime = 1662211353;
        await this.deployedContract.setSaleStartTime(saleStartTime);
        expect(await this.deployedContract.saleStartTime()).to.equal(saleStartTime);
    })


    it('sellingStep should the step to 1 (WlSale)', async function () {
        await this.deployedContract.setStep(1);
        expect(await this.deployedContract.sellingStep()).to.equal(1);
    })

    it("Should mint one NFT on the whitelist sale if the user is whitelisted", async function () {
        const leaf = keccak256(this.addr1.address);
        const proof = this.tree.getHexProof(leaf);

        let price = await this.deployedContract.wlSalePrice();

        const overrides = {
            value: price
        }

        await this.deployedContract.connect(this.addr1).whitelistMint(this.addr1.address, 1, proof, overrides);
    })

    it("Should NOT mint one NFT on the whitelist sale if the user is NOT whitelisted", async function () {
        const leaf = keccak256(this.addr3.address);
        const proof = this.tree.getHexProof(leaf);

        let price = await this.deployedContract.wlSalePrice();

        const overrides = {
            value: price
        }

        await expect(this.deployedContract.connect(this.addr3).whitelistMint(this.addr3.address, 1, proof, overrides)).to.be.revertedWith('Not whitelisted');
    })

    it("shoud get the totalSupply and the total supply should be equal to 1", async function () {
        expect(await this.deployedContract.totalSupply()).to.equal(1);
    })


    it('sellingStep should the step to 2 (public mint)', async function () {
        await this.deployedContract.setStep(2);
        expect(await this.deployedContract.sellingStep()).to.equal(2);
    })

    it("Sould set the set start time", async function () {
        let saleStartTime = 1662211353 - 30 * 60 * 60;
        await this.deployedContract.setSaleStartTime(saleStartTime);
        expect(await this.deployedContract.saleStartTime()).to.equal(saleStartTime);
    })

    it('Should mint 3 NFT during the public sale', async function () {
        let price = await this.deployedContract.publicSalePrice();
        let finalPrice = price.mul(3); // price for 3 NFTs

        const overrides = {
            value: finalPrice
        }

        await this.deployedContract.connect(this.addr1).publicMint(this.addr1.address, 3, overrides);


    })

})