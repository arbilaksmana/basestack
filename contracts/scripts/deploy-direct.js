// Direct deploy script using ethers without hardhat runtime
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Starting direct deployment to Base Sepolia...");

    // Base Sepolia RPC
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    // Private Key from .env
    const privateKey = "9e7de06dee83df2c68df96a0a146c2af327edd0f44007fbcf1c9e139fdb2e5d7";
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deployer:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    // Load compiled artifacts
    const mockERC20Path = path.join(__dirname, "../artifacts/src/MockERC20.sol/MockERC20.json");
    const subscriptionPath = path.join(__dirname, "../artifacts/src/SubscriptionManager.sol/SubscriptionManager.json");

    if (!fs.existsSync(mockERC20Path) || !fs.existsSync(subscriptionPath)) {
        throw new Error("Artifacts not found. Please run 'npx hardhat compile' first.");
    }

    const MockERC20Artifact = JSON.parse(fs.readFileSync(mockERC20Path, "utf8"));
    const SubscriptionArtifact = JSON.parse(fs.readFileSync(subscriptionPath, "utf8"));

    // Helper to wait
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    const MockERC20Factory = new ethers.ContractFactory(MockERC20Artifact.abi, MockERC20Artifact.bytecode, wallet);

    // 1. Deploy IDRX (Custom)
    console.log("\nDeploying IDRX...");
    // IDRX has 2 decimals
    const idrx = await MockERC20Factory.deploy("IDRX Token", "IDRX", 2);
    await idrx.waitForDeployment();
    const idrxAddress = await idrx.getAddress();
    console.log("IDRX deployed to:", idrxAddress);
    await wait(2000);

    // 2. Use Existing USDC
    const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; 
    console.log("Using USDC at:", usdcAddress);

    // 3. Deploy USDT (Custom Mock)
    console.log("Deploying USDT...");
    const usdt = await MockERC20Factory.deploy("Tether USD", "USDT", 6);
    await usdt.waitForDeployment();
    const usdtAddress = await usdt.getAddress();
    console.log("USDT deployed to:", usdtAddress);
    await wait(2000);

    // 4. Deploy SubscriptionManager
    console.log("\nDeploying SubscriptionManager...");
    const SubManagerFactory = new ethers.ContractFactory(SubscriptionArtifact.abi, SubscriptionArtifact.bytecode, wallet);
    const subManager = await SubManagerFactory.deploy(idrxAddress, usdcAddress, usdtAddress, wallet.address);
    await subManager.waitForDeployment();
    const subManagerAddress = await subManager.getAddress();
    console.log("SubscriptionManager deployed to:", subManagerAddress);
    await wait(2000);

    // 5. Mint tokens to deployer (for testing)
    console.log("\n--- Minting test tokens ---");
    // Mint IDRX
    let tx = await idrx.mint(wallet.address, 10000000n * 100n); // 10M IDRX
    await tx.wait();
    console.log("Minted 10M IDRX");

    // Mint USDT
    tx = await usdt.mint(wallet.address, 100000n * 1000000n); // 100K USDT
    await tx.wait();
    console.log("Minted 100K USDT");
    // Cannot mint USDC (using existing)

    // Summary
    console.log("\n========================================");
    console.log("DEPLOYMENT COMPLETE!");
    console.log("========================================");
    console.log("\nUpdate .env / .env.local with:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${subManagerAddress}`);
    console.log(`NEXT_PUBLIC_TOKEN_IDRX=${idrxAddress}`);
    console.log(`NEXT_PUBLIC_TOKEN_USDC=${usdcAddress}`);
    console.log(`NEXT_PUBLIC_TOKEN_USDT=${usdtAddress}`);
    console.log("========================================");
}

main().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});
