// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// @author Antopablo https://www.linkedin.com/in/antonylefevre/

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ERC721A.sol";

contract SmileyERC721A is Ownable, ERC712A, PaymentSplitter {}
