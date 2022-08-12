// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// @author Antopablo https://www.linkedin.com/in/antonylefevre/

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ERC721A.sol";
import "./ERC721AQueryable.sol";

contract SmileyERC721A is Ownable, ERC721A, ERC721AQueryable, PaymentSplitter {
    using Strings for uint256;

    enum Step {
        Before,
        WhitelistSale,
        PublicSale,
        SoldOut,
        Reveal
    }

    Step public sellingStep;

    uint256 private constant MAX_SUPPLY = 30;
    uint256 private constant MAX_GIFT = 5;
    uint256 private constant MAX_WHITELIST = 5;
    uint256 private constant MAX_PUBLIC = 20;
    uint256 private constant MAX_SUPPLY_MINUS_GIFT = MAX_SUPPLY - MAX_GIFT;

    uint256 public wlSalePrice = 0.01 ether;
    uint256 public publicSalePrice = 0.03 ether;

    uint256 public saleStartTime = 1661983201;

    bytes32 public merkleRoot;

    string public baseURI;

    mapping(address => uint256) amountNFTperWalletWhiteListSale;
    mapping(address => uint256) amountNFTperWalletPublicSale;

    uint256 private constant MAX_PER_ADRESS_DURING_WHITELIST_MINT = 1;
    uint256 private constant MAX_PER_ADRESS_DURING_PUBLIC_MINT = 3;

    bool public isPaused;

    uint256 private teamLength;

    address[] private _team = [
        0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,
        0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    ];

    uint256[] private _teamShares = [700, 300];

    constructor(bytes32 _merkleRoot, string memory _baseURI)
        ERC721A("Smiley", "SMY")
        PaymentSplitter(_team, _teamShares)
    {
        merkleRoot = _merkleRoot;
        baseURI = _baseURI;
        teamLength = _team.length;
    }

    /**
     * @notice Change whitelist sale price
     *
     * @param _wlSalePrice The new price
     */
    function setWlSalePrice(uint256 _wlSalePrice) external onlyOwner {
        wlSalePrice = _wlSalePrice;
    }

    /**
     * @notice Change public sale price
     *
     * @param _publicSalePrice The new price
     */
    function setPublicSalePrice(uint256 _publicSalePrice) external onlyOwner {
        publicSalePrice = _publicSalePrice;
    }

    /**
     * @notice Change start time
     *
     * @param _saleStartTime The new timestamp
     */
    function setSaleStartTime(uint256 _saleStartTime) external onlyOwner {
        saleStartTime = _saleStartTime;
    }

    /**
     * @notice Return current timestamp
     *
     * @return currentTimeStamp The current timestamp
     */
    function currentTime() internal view returns (uint256) {
        return block.timestamp;
    }

    /**
     * @notice Change the step of the sale
     *
     * @param _step The new step
     */
    function setStep(Step _step) external onlyOwner {
        // mettre uint et convertir _step en Step(_step)
        sellingStep = _step;
    }

    /**
     * @notice Change the state of isPaused
     *
     * @param _isPaused state
     */
    function setPause(bool _isPaused) external onlyOwner {
        isPaused = _isPaused;
    }

    /**
     * @notice Change the baseURI
     *
     * @param _baseURI new baseURI
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    /**
     * @notice Change the merkleRoot
     *
     * @param _merkleRoot new merkleRoot
     */
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    /**
     * @notice Hash an address
     *
     * @param _account address to be hashed
     *
     * @return bytes32 The hashed address
     */
    function leaf(address _account) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_account));
    }

    /**
     * @notice Returns true if a leaf can be proved to be a part of a merkle tree definied by root
     *
     * @param _leaf the leaf
     * @param _proof the merkle proof
     *
     * @return bool if a leaf can be proved to be a part of a merkle tree definied by root
     */
    function _verify(bytes32 _leaf, bytes32[] memory _proof)
        internal
        view
        returns (bool)
    {
        return MerkleProof.verify(_proof, merkleRoot, _leaf);
    }

    /**
     * @notice Check if an address is whitelisted or not
     *
     * @param _account The account to check
     * @param _proof the merkle proof
     *
     * @return bool true if whitelisted
     */
    function isWhiteListed(address _account, bytes32[] calldata _proof)
        internal
        view
        returns (bool)
    {
        return _verify(leaf(_account), _proof);
    }
}
