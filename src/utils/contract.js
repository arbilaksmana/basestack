const { ethers } = require('ethers');
const config = require('../config');

// Minimal ABI for subscription contract
const SUBSCRIPTION_ABI = [
  'function chargeSubscription(address user, uint256 planId) external returns (bool)',
  'function subscribe(uint256 planId, address token) external returns (bool)',
  'event SubscriptionCharged(address indexed user, uint256 indexed planId, uint256 amount)',
  'event Subscribed(address indexed user, uint256 indexed planId, address token, uint256 amount)'
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

// Verify subscription transaction
async function verifySubscriptionTx(txHash, expectedWallet, expectedPlanId) {
  try {
    const provider = getProvider();
    const result = await provider.getTransaction(txHash);

    // Check if tx exists
    if (!result) {
      return { verified: false, reason: 'Transaction not found' };
    }

    // Check tx recipient (must be our contract)
    const contractAddress = config.blockchain.contractAddress;
    if (result.to.toLowerCase() !== contractAddress.toLowerCase()) {
      return { verified: false, reason: 'Transaction not sent to Subscription contract' };
    }

    // Check receipt for status
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status === 0) {
      return { verified: false, reason: 'Transaction failed or not mined' };
    }

    // Check if sender matches expected wallet
    if (result.from.toLowerCase() !== expectedWallet.toLowerCase()) {
      return { verified: false, reason: 'Transaction wallet mismatch' };
    }

    // Parse logs to find Subscribed event
    const contract = getContract();
    const iface = contract.interface;

    let subscriptionEvent = null;

    console.log(`[Verify] Checking logs for Tx: ${txHash}`);
    console.log(`[Verify] Expected Contract: ${contractAddress}`);

    for (const log of receipt.logs) {
      try {
        console.log(`[Verify] Log Address: ${log.address}`);
        // Only parse logs from our contract
        if (log.address.toLowerCase() !== contractAddress.toLowerCase()) continue;

        const parsed = iface.parseLog(log);
        if (parsed) {
          console.log(`[Verify] Parsed Event: ${parsed.name}`);
          if (parsed.name === 'Subscribed') {
            subscriptionEvent = parsed;
            break;
          }
        }
      } catch (e) {
        console.log(`[Verify] Parse Error: ${e.message}`);
        // Ignore parsing errors for other events
      }
    }

    if (!subscriptionEvent) {
      return { verified: false, reason: 'No Subscribed event found in transaction' };
    }

    // Verify event args
    // Args: user, planId, token, amount
    const eventPlanId = Number(subscriptionEvent.args[1]);
    const eventUser = subscriptionEvent.args[0];

    if (eventPlanId !== Number(expectedPlanId)) {
      return { verified: false, reason: `Plan ID mismatch. Event: ${eventPlanId}, Expected: ${expectedPlanId}` };
    }

    if (eventUser.toLowerCase() !== expectedWallet.toLowerCase()) {
      return { verified: false, reason: 'Subscriber wallet mismatch in event' };
    }

    return { verified: true, receipt, amount: subscriptionEvent.args[2] }; // Return verified result
  } catch (err) {
    console.error("Verification error:", err);
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
