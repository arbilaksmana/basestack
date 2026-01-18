// Contract utility for interacting with SubscriptionManager smart contract
import { ethers } from "ethers";

// Contract addresses from environment
export const CONTRACT_CONFIG = {
    SUBSCRIPTION_MANAGER: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    TOKEN_IDRX: process.env.NEXT_PUBLIC_TOKEN_IDRX || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    TOKEN_USDC: process.env.NEXT_PUBLIC_TOKEN_USDC || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    TOKEN_USDT: process.env.NEXT_PUBLIC_TOKEN_USDT || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545",
};

// Get token address by symbol
export function getTokenAddress(symbol: string): string {
    switch (symbol.toUpperCase()) {
        case "IDRX": return CONTRACT_CONFIG.TOKEN_IDRX;
        case "USDC": return CONTRACT_CONFIG.TOKEN_USDC;
        case "USDT": return CONTRACT_CONFIG.TOKEN_USDT;
        default: throw new Error(`Unknown token: ${symbol}`);
    }
}

// ERC20 ABI (minimal for approve and allowance)
export const ERC20_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
];

// SubscriptionManager ABI
export const SUBSCRIPTION_MANAGER_ABI = [
    // Read functions
    "function planCount() view returns (uint256)",
    "function plans(uint256 planId) view returns (address merchant, uint256 priceIdrx, uint256 priceUsdc, uint256 priceUsdt, uint256 billingInterval, bool active)",
    "function subscriptions(address user, uint256 planId) view returns (uint256 planId, address token, uint256 amount, uint256 nextPayment, bool active)",
    "function getPlan(uint256 planId) view returns (tuple(address merchant, uint256 priceIdrx, uint256 priceUsdc, uint256 priceUsdt, uint256 billingInterval, bool active))",
    "function getSubscription(address user, uint256 planId) view returns (tuple(uint256 planId, address token, uint256 amount, uint256 nextPayment, bool active))",
    "function idrxToken() view returns (address)",
    "function usdcToken() view returns (address)",
    "function usdtToken() view returns (address)",

    // Write functions
    "function createPlan(uint256 priceIdrx, uint256 priceUsdc, uint256 priceUsdt, uint256 billingInterval) returns (uint256)",
    "function subscribe(uint256 planId, address token)",
    "function cancelSubscription(uint256 planId)",
    "function deactivatePlan(uint256 planId)",

    // Events
    "event PlanCreated(uint256 indexed planId, address indexed merchant)",
    "event Subscribed(address indexed user, uint256 indexed planId, address token, uint256 amount)",
    "event SubscriptionCharged(address indexed user, uint256 indexed planId, uint256 amount)",
    "event SubscriptionCanceled(address indexed user, uint256 indexed planId)",
];

// Get ethereum provider
export function getProvider() {
    if (typeof window !== "undefined" && window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    return new ethers.JsonRpcProvider(CONTRACT_CONFIG.RPC_URL);
}

// Get signer from wallet
export async function getSigner() {
    const provider = getProvider();
    if (provider instanceof ethers.BrowserProvider) {
        return await provider.getSigner();
    }
    throw new Error("No wallet connected");
}

// Get contract instances
export function getSubscriptionManagerContract(signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(
        CONTRACT_CONFIG.SUBSCRIPTION_MANAGER,
        SUBSCRIPTION_MANAGER_ABI,
        signerOrProvider
    );
}

export function getTokenContract(tokenAddress: string, signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider);
}

// ============================================
// CONTRACT INTERACTIONS
// ============================================

/**
 * Create a new subscription plan on-chain
 */
export async function createPlanOnchain(
    priceIdrx: string,
    priceUsdc: string,
    priceUsdt: string,
    billingIntervalSeconds: number
): Promise<{ txHash: string; planId: number }> {
    const signer = await getSigner();
    const contract = getSubscriptionManagerContract(signer);

    // Convert prices to wei (18 decimals for IDRX, 6 for USDC/USDT)
    const priceIdrxWei = ethers.parseUnits(priceIdrx, 2); // IDRX has 2 decimals
    const priceUsdcWei = ethers.parseUnits(priceUsdc, 6); // USDC has 6 decimals
    const priceUsdtWei = ethers.parseUnits(priceUsdt, 6); // USDT has 6 decimals

    const tx = await contract.createPlan(
        priceIdrxWei,
        priceUsdcWei,
        priceUsdtWei,
        billingIntervalSeconds
    );

    const receipt = await tx.wait();

    // Parse event to get planId
    const event = receipt.logs.find(
        (log: ethers.Log) => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === "PlanCreated";
            } catch {
                return false;
            }
        }
    );

    let planId = 0;
    if (event) {
        const parsed = contract.interface.parseLog(event);
        planId = Number(parsed?.args?.planId || 0);
    }

    return {
        txHash: receipt.hash,
        planId,
    };
}

/**
 * Subscribe to a plan
 * Steps: 1. Check allowance, 2. Approve if needed, 3. Subscribe
 */
export async function subscribeOnchain(
    planId: number,
    tokenSymbol: string,
    amount: string | number
): Promise<{ txHash: string; approveTxHash?: string }> {
    const signer = await getSigner();
    const userAddress = await signer.getAddress();
    const tokenAddress = getTokenAddress(tokenSymbol);

    const tokenContract = getTokenContract(tokenAddress, signer);
    const subscriptionContract = getSubscriptionManagerContract(signer);

    // Get decimals for amount conversion
    const decimals = tokenSymbol === "IDRX" ? 2 : 6;
    // Ensure amount is a string for parseUnits
    const amountStr = String(amount);
    const amountWei = ethers.parseUnits(amountStr, decimals);

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(userAddress, CONTRACT_CONFIG.SUBSCRIPTION_MANAGER);

    let approveTxHash: string | undefined;

    // Approve if needed (approve max uint256 for convenience)
    if (currentAllowance < amountWei) {
        const approveTx = await tokenContract.approve(
            CONTRACT_CONFIG.SUBSCRIPTION_MANAGER,
            ethers.MaxUint256 // Approves unlimited for convenience
        );
        const approveReceipt = await approveTx.wait();
        approveTxHash = approveReceipt.hash;
    }

    // Subscribe
    const subscribeTx = await subscriptionContract.subscribe(planId, tokenAddress);
    const subscribeReceipt = await subscribeTx.wait();

    return {
        txHash: subscribeReceipt.hash,
        approveTxHash,
    };
}

/**
 * Cancel a subscription on-chain
 */
export async function cancelSubscriptionOnchain(planId: number): Promise<{ txHash: string }> {
    const signer = await getSigner();
    const contract = getSubscriptionManagerContract(signer);

    const tx = await contract.cancelSubscription(planId);
    const receipt = await tx.wait();

    return {
        txHash: receipt.hash,
    };
}

/**
 * Check if user is subscribed to a plan
 */
export async function checkSubscription(userAddress: string, planId: number): Promise<{
    isActive: boolean;
    nextPayment: number;
    amount: string;
    token: string;
}> {
    const provider = getProvider();
    const contract = getSubscriptionManagerContract(provider);

    const sub = await contract.getSubscription(userAddress, planId);

    return {
        isActive: sub.active,
        nextPayment: Number(sub.nextPayment),
        amount: sub.amount.toString(),
        token: sub.token,
    };
}

/**
 * Get plan details from chain
 */
export async function getPlanOnchain(planId: number): Promise<{
    merchant: string;
    priceIdrx: string;
    priceUsdc: string;
    priceUsdt: string;
    billingInterval: number;
    active: boolean;
}> {
    const provider = getProvider();
    const contract = getSubscriptionManagerContract(provider);

    const plan = await contract.getPlan(planId);

    return {
        merchant: plan.merchant,
        priceIdrx: ethers.formatUnits(plan.priceIdrx, 2),
        priceUsdc: ethers.formatUnits(plan.priceUsdc, 6),
        priceUsdt: ethers.formatUnits(plan.priceUsdt, 6),
        billingInterval: Number(plan.billingInterval),
        active: plan.active,
    };
}

/**
 * Get token balance
 */
export async function getTokenBalance(userAddress: string, tokenSymbol: string): Promise<string> {
    const provider = getProvider();
    const tokenAddress = getTokenAddress(tokenSymbol);
    const tokenContract = getTokenContract(tokenAddress, provider);

    const decimals = tokenSymbol === "IDRX" ? 2 : 6;
    const balance = await tokenContract.balanceOf(userAddress);

    return ethers.formatUnits(balance, decimals);
}
