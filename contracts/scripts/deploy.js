const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment...");

    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];
    console.log("Deployer address:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

    // Deploy mock tokens
    console.log("\n--- Deploying Mock Tokens ---");

    // Deploy IDRX
    console.log("Deploying IDRX...");
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const idrx = await MockERC20.deploy("IDRX Token", "IDRX", 2);
    const idrxReceipt = await idrx.deploymentTransaction().wait();
    const idrxAddress = idrx.target;
    console.log("IDRX deployed to:", idrxAddress);

    // Deploy USDC
    console.log("Deploying USDC...");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.deploymentTransaction().wait();
    const usdcAddress = usdc.target;
    console.log("USDC deployed to:", usdcAddress);

    // Deploy USDT
    console.log("Deploying USDT...");
    const usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
    await usdt.deploymentTransaction().wait();
    const usdtAddress = usdt.target;
    console.log("USDT deployed to:", usdtAddress);

    // Deploy SubscriptionManager
    console.log("\n--- Deploying SubscriptionManager ---");
    const SubscriptionManager = await hre.ethers.getContractFactory("SubscriptionManager");
    const subManager = await SubscriptionManager.deploy(
      idrxAddress,
      usdcAddress,
      usdtAddress,
      deployer.address
    );
    await subManager.deploymentTransaction().wait();
    const subManagerAddress = subManager.target;
    console.log("SubscriptionManager deployed to:", subManagerAddress);

    // Mint tokens
    console.log("\n--- Minting test tokens ---");

    // IDRX: 10M tokens with 2 decimals = 10,000,000 * 10^2 = 1,000,000,000
    await idrx.mint(deployer.address, 1000000000n);
    console.log("Minted 10M IDRX to deployer");

    // USDC: 100K tokens with 6 decimals = 100,000 * 10^6 = 100,000,000,000
    await usdc.mint(deployer.address, 100000000000n);
    console.log("Minted 100K USDC to deployer");

    // USDT: 100K tokens with 6 decimals = 100,000 * 10^6 = 100,000,000,000
    await usdt.mint(deployer.address, 100000000000n);
    console.log("Minted 100K USDT to deployer");

    // Summary
    console.log("\n========================================");
    console.log("DEPLOYMENT COMPLETE!");
    console.log("========================================");
    console.log("\nUpdate .env with:");
    console.log(`CONTRACT_ADDRESS=${subManagerAddress}`);
    console.log(`TOKEN_IDRX=${idrxAddress}`);
    console.log(`TOKEN_USDC=${usdcAddress}`);
    console.log(`TOKEN_USDT=${usdtAddress}`);
    console.log("\nFor frontend .env.local:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${subManagerAddress}`);
    console.log(`NEXT_PUBLIC_TOKEN_IDRX=${idrxAddress}`);
    console.log(`NEXT_PUBLIC_TOKEN_USDC=${usdcAddress}`);
    console.log(`NEXT_PUBLIC_TOKEN_USDT=${usdtAddress}`);
    console.log("========================================");

  } catch (error) {
    console.error("Deployment error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
