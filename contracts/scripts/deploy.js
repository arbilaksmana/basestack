const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // For testnet, deploy mock tokens first
  console.log("\n--- Deploying Mock Tokens ---");
  
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  
  // Deploy IDRX (0 decimals for simplicity)
  const idrx = await MockERC20.deploy("IDRX Token", "IDRX", 0);
  await idrx.waitForDeployment();
  console.log("IDRX Token deployed to:", await idrx.getAddress());
  
  // Deploy USDC (6 decimals)
  const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  console.log("USDC Token deployed to:", await usdc.getAddress());
  
  // Deploy USDT (6 decimals)
  const usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
  await usdt.waitForDeployment();
  console.log("USDT Token deployed to:", await usdt.getAddress());

  // Deploy SubscriptionManager
  console.log("\n--- Deploying SubscriptionManager ---");
  
  const SubscriptionManager = await hre.ethers.getContractFactory("SubscriptionManager");
  const subscriptionManager = await SubscriptionManager.deploy(
    await idrx.getAddress(),
    await usdc.getAddress(),
    await usdt.getAddress(),
    deployer.address // keeper address
  );
  await subscriptionManager.waitForDeployment();
  console.log("SubscriptionManager deployed to:", await subscriptionManager.getAddress());

  // Mint some tokens to deployer for testing
  console.log("\n--- Minting test tokens ---");
  await idrx.mint(deployer.address, 1000000); // 1M IDRX
  await usdc.mint(deployer.address, 10000 * 10**6); // 10K USDC
  await usdt.mint(deployer.address, 10000 * 10**6); // 10K USDT
  console.log("Minted test tokens to deployer");

  // Print summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log("\nUpdate your .env file with these values:\n");
  console.log(`CONTRACT_ADDRESS=${await subscriptionManager.getAddress()}`);
  console.log(`TOKEN_IDRX=${await idrx.getAddress()}`);
  console.log(`TOKEN_USDC=${await usdc.getAddress()}`);
  console.log(`TOKEN_USDT=${await usdt.getAddress()}`);
  console.log("\n========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
