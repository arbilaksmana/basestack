const { ethers } = require('ethers');
const config = require('../config');

// Minimal ABI for subscription contract
const SUBSCRIPTION_ABI = [
  'function chargeSubscription(address user, uint256 planId) external returns (bool)',
  'function subscribe(uint256 planId, address token) external returns (bool)',
  'event SubscriptionCharged(address indexed user, uint256 indexed planId, uint256 amount)',
  'event Subscribed(address indexed user, uint256 indexed planId, address token)'
];

let provider = null;
let wallet = null;
let contract = null;

// Get provider instance
function getProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
  }
  return provider;
}

// Get wallet instance (for keeper bot)
function getWallet() {
  if (!wallet && config.blockchain.privateKey) {
    wallet = new ethers.Wallet(config.blockchain.privateKey, getProvider());
  }
  return wallet;
}

// Get contract instance
function getContract() {
  if (!contract) {
    const signer = getWallet();
    contract = new ethers.Contract(
      config.blockchain.contractAddress,
      SUBSCRIPTION_ABI,
      signer || getProvider()
    );
  }
  return contract;
}

// Charge subscription on-chain (called by keeper)
async function chargeSubscription(userWallet, planId) {
  try {
    const contract = getContract();
    const tx = await contract.chargeSubscription(userWallet, planId);
    const receipt = await tx.wait();
    return { success: true, txHash: receipt.hash };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Verify subscription transaction (stub - check if tx exists and succeeded)
async function verifySubscriptionTx(txHash) {
  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return { verified: false, reason: 'Transaction not found' };
    }
    
    if (receipt.status === 0) {
      return { verified: false, reason: 'Transaction failed' };
    }
    
    return { verified: true, receipt };
  } catch (err) {
    return { verified: false, reason: err.message };
  }
}

// Verify wallet signature (for auth)
function verifySignature(walletAddress, signature, message) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (err) {
    return false;
  }
}

module.exports = {
  getProvider,
  getWallet,
  getContract,
  chargeSubscription,
  verifySubscriptionTx,
  verifySignature
};
