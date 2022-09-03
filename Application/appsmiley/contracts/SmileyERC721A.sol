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
    uint256 private constant MAX_GIFT = 3;
    uint256 private constant MAX_WHITELIST = 5;
    uint256 private constant MAX_PUBLIC = 22;
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
     * @notice This contract can't ve called by other contracts
     */
    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract");
        _;
    }

    /**
     * @notice Mint function for the whitelist sales
     *
     * @param _account Account which will receive the NFT
     * @param _quantity Number of NFT the user wants to mine
     * @param _proof MerckleProof
     *
     */
    function whitelistMint(
        address _account,
        uint256 _quantity,
        bytes32[] calldata _proof
    ) external payable callerIsUser {
        require(!isPaused, "Contract is paused");
        require(currentTime() >= saleStartTime, "Sale has not started yet");
        require(currentTime() < saleStartTime + 12 hours, "Sale is finished");

        uint256 price = wlSalePrice;
        require(price != 0, "Price is 0");
        require(
            sellingStep == Step.WhitelistSale,
            "Whitelist sale is not activated"
        );
        require(isWhiteListed(msg.sender, _proof), "Not whitelisted");
        require(
            amountNFTperWalletWhiteListSale[msg.sender] + _quantity <=
                MAX_PER_ADRESS_DURING_WHITELIST_MINT,
            "You can only get 1 NFT on whitelist"
        );
        require(
            totalSupply() + _quantity <= MAX_WHITELIST,
            "Max supply exceeded"
        );
        require(msg.value >= price * _quantity, "Not enought founds");
        amountNFTperWalletWhiteListSale[msg.sender] += _quantity;

        _safeMint(_account, _quantity);
    }

    /**
     * @notice Mint function for the public mint
     *
     * @param _account Account which will receive the NFT
     * @param _quantity  Number of NFT the user wants to mine
     *
     */
    function publicMint(address _account, uint256 _quantity)
        external
        payable
        callerIsUser
    {
        require(!isPaused, "Contract is paused");
        require(
            currentTime() > saleStartTime + 24 hours,
            "Public sales has not started yet"
        );
        require(
            currentTime() < saleStartTime + 48 hours,
            "Public sales is finish"
        );

        uint256 price = publicSalePrice;
        require(price > 0, "Price is 0");
        require(sellingStep == Step.PublicSale, "Public sale is not activated");
        require(
            amountNFTperWalletPublicSale[msg.sender] + _quantity <=
                MAX_PER_ADRESS_DURING_PUBLIC_MINT,
            "You can only get 3 NFTs on the whitelist sale"
        );
        require(
            totalSupply() + _quantity <= MAX_SUPPLY_MINUS_GIFT,
            "Max supply exceeded"
        );
        require(msg.value >= price * _quantity, "Not enought funds");
        amountNFTperWalletPublicSale[msg.sender] += _quantity;
        _safeMint(_account, _quantity);
    }

    /**
     * @notice Allow the owner to gift NFTs
     *
     * @param _to The address of the receiver
     * @param _quantity Amount of NFTs to owner wants to gift
     *
     */
    function gift(address _to, uint256 _quantity) external onlyOwner {
        require(sellingStep > Step.PublicSale, "Gift is after the public sale");
        require(totalSupply() + _quantity <= MAX_SUPPLY, "Reach max supply");
        _safeMint(_to, _quantity);
    }

    /**
     * @notice Get the token URI of an NFT by his ID
     *
     * @param _tokenId The ID Token
     *
     * @return TokenURI The URI
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721A, IERC721A)
        returns (string memory)
    {
        require(_exists(_tokenId), "URI query for nonexistant token.");

        return string(abi.encodePacked(baseURI, _tokenId.toString(), ".json"));
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

    /**
     * @notice Release the gains on every account team
     *
     */
    function releaseAll() external {
        for (uint8 i = 0; i < teamLength; i++) {
            release(payable(payee(i)));
        }
    }

    // not allowing receiving ethers outside minting function
    receive() external payable override {
        revert("Only if you mint");
    }
}
