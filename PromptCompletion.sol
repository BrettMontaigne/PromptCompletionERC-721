// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FunctionsConsumer is FunctionsClient, ConfirmedOwner, ERC721URIStorage, ReentrancyGuard {
  using Functions for Functions.Request;

  uint256 public tokenCounter;
  mapping(bytes32 => address) private requestIdToRequester;

  event OCRResponse(bytes32 indexed id, bytes result, bytes err);

  constructor(address oracle) 
    FunctionsClient(oracle) 
    ConfirmedOwner(msg.sender) 
    ERC721("GPTPromptCompletionNFT", "GPT-PC-NFT") {
    tokenCounter = 0;
  }

  function executeRequest(
    string calldata source,
    bytes calldata secrets,
    string[] calldata args,
    uint64 subscriptionId,
    uint32 gasLimit
  ) public onlyOwner nonReentrant returns (bytes32) {
    require(bytes(source).length > 0, "Source cannot be empty");

    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);

    if (secrets.length > 0) req.addRemoteSecrets(secrets);
    if (args.length > 0) req.addArgs(args);

    bytes32 id = sendRequest(req, subscriptionId, gasLimit);
    requestIdToRequester[id] = msg.sender;

    return id;
  }

  function fulfillRequest(bytes32 id, bytes memory _response, bytes memory _error) internal override {
    emit OCRResponse(id, _response, _error);

    if (_error.length == 0 && requestIdToRequester[id] != address(0)) {
      address requester = requestIdToRequester[id];
      string memory ipfsHash = string(_response);
      mintNFT(ipfsHash, requester);
    }
  }

  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }

  function mintNFT(string memory ipfsHash, address requester) private {
    require(requester != address(0), "Invalid requester address");
    
    uint256 newTokenId = tokenCounter;
    _mint(requester, newTokenId);
    _setTokenURI(newTokenId, ipfsHash);
    
    tokenCounter++;
  }

  function addSimulatedRequestId(address oracleAddress, bytes32 id) public onlyOwner {
    addExternalRequest(oracleAddress, id);
  }
}
