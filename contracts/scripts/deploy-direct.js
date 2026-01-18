// Direct deploy script using ethers without hardhat runtime
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Starting direct deployment...");

    // Connect to local hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Use hardhat account #0
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deployer:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    // Load compiled artifacts
    const mockERC20Path = path.join(__dirname, "../artifacts/src/MockERC20.sol/MockERC20.json");
    const subscriptionPath = path.join(__dirname, "../artifacts/src/SubscriptionManager.sol/SubscriptionManager.json");

    const MockERC20Artifact = JSON.parse(fs.readFileSync(mockERC20Path, "utf8"));
    const SubscriptionArtifact = JSON.parse(fs.readFileSync(subscriptionPath, "utf8"));

    // Helper to wait
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    // Deploy IDRX
    console.log("\nDeploying IDRX...");
    const MockERC20Factory = new ethers.ContractFactory(MockERC20Artifact.abi, MockERC20Artifact.bytecode, wallet);
    const idrx = await MockERC20Factory.deploy("IDRX Token", "IDRX", 2);
    await idrx.waitForDeployment();
    const idrxAddress = await idrx.getAddress();
    console.log("IDRX deployed to:", idrxAddress);
    await wait(500);

    // Deploy USDC
    console.log("Deploying USDC...");
    const usdc = await MockERC20Factory.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("USDC deployed to:", usdcAddress);
    await wait(500);

    // Deploy USDT
    console.log("Deploying USDT...");
    const usdt = await MockERC20Factory.deploy("Tether USD", "USDT", 6);
    await usdt.waitForDeployment();
    const usdtAddress = await usdt.getAddress();
    console.log("USDT deployed to:", usdtAddress);
    await wait(500);

    // Deploy SubscriptionManager
    console.log("\nDeploying SubscriptionManager...");
    const SubManagerFactory = new ethers.ContractFactory(SubscriptionArtifact.abi, SubscriptionArtifact.bytecode, wallet);
    const subManager = await SubManagerFactory.deploy(idrxAddress, usdcAddress, usdtAddress, wallet.address);
    await subManager.waitForDeployment();
    const subManagerAddress = await subManager.getAddress();
    console.log("SubscriptionManager deployed to:", subManagerAddress);
    await wait(500);

    // Mint tokens
    console.log("\n--- Minting test tokens ---");
    let tx = await idrx.mint(wallet.address, 10000000n * 100n); // 10M IDRX
    await tx.wait();
    console.log("Minted 10M IDRX");

    tx = await usdc.mint(wallet.address, 100000n * 1000000n); // 100K USDC
    await tx.wait();
    console.log("Minted 100K USDC");

    tx = await usdt.mint(wallet.address, 100000n * 1000000n); // 100K USDT
    await tx.wait();
    console.log("Minted 100K USDT");

    // Verify balances
    console.log("\n--- Verifying balances ---");
    const idrxBal = await idrx.balanceOf(wallet.address);
    const usdcBal = await usdc.balanceOf(wallet.address);
    const usdtBal = await usdt.balanceOf(wallet.address);
    console.log("IDRX:", ethers.formatUnits(idrxBal, 2));
    console.log("USDC:", ethers.formatUnits(usdcBal, 6));
    console.log("USDT:", ethers.formatUnits(usdtBal, 6));

    // Summary
    console.log("\n========================================");
    console.log("DEPLOYMENT COMPLETE!");
    console.log("========================================");
    console.log("\nContract Addresses:");
    console.log(`CONTRACT_ADDRESS=${subManagerAddress}`);
    console.log(`TOKEN_IDRX=${idrxAddress}`);
    console.log(`TOKEN_USDC=${usdcAddress}`);
    console.log(`TOKEN_USDT=${usdtAddress}`);
    console.log("\nUpdate frontend/.env.local:");
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
