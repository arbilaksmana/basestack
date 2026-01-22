const hre = require("hardhat");

async function main() {
  console.log("Starting minimal deployment...");

  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Use existing well-known testnet token addresses or zero addresses for now
  // These are placeholder addresses - the subscription logic will still work
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  
  // Deploy only SubscriptionManager with zero addresses
  // In production, you'd use real token addresses
  console.log("\n--- Deploying SubscriptionManager ---");
  const SubscriptionManager = await hre.ethers.getContractFactory("SubscriptionManager");
  const subManager = await SubscriptionManager.deploy(
    ZERO_ADDRESS, // IDRX placeholder
    ZERO_ADDRESS, // USDC placeholder  
    ZERO_ADDRESS, // USDT placeholder
    deployer.address
  );
  await subManager.deploymentTransaction().wait();
  const subManagerAddress = subManager.target;
  console.log("SubscriptionManager deployed to:", subManagerAddress);

  // Summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log("\nUpdate .env with:");
  console.log(`CONTRACT_ADDRESS=${subManagerAddress}`);
  console.log("\nFor frontend .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${subManagerAddress}`);
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
