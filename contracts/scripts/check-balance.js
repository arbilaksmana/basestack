const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Checking balances for:", deployer.address);

    // Token addresses
    const IDRX_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const USDC_ADDR = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const USDT_ADDR = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");

    const idrx = MockERC20.attach(IDRX_ADDR);
    const usdc = MockERC20.attach(USDC_ADDR);
    const usdt = MockERC20.attach(USDT_ADDR);

    // Check balances
    const idrxBal = await idrx.balanceOf(deployer.address);
    const usdcBal = await usdc.balanceOf(deployer.address);
    const usdtBal = await usdt.balanceOf(deployer.address);

    console.log("\n=== Current Balances ===");
    console.log("IDRX:", hre.ethers.formatUnits(idrxBal, 2));
    console.log("USDC:", hre.ethers.formatUnits(usdcBal, 6));
    console.log("USDT:", hre.ethers.formatUnits(usdtBal, 6));

    // If balances are 0, mint tokens
    if (idrxBal === 0n) {
        console.log("\n=== Minting Tokens ===");
        await idrx.mint(deployer.address, 10000000n * 100n); // 10M IDRX
        console.log("Minted 10M IDRX");

        await usdc.mint(deployer.address, 100000n * 1000000n); // 100K USDC
        console.log("Minted 100K USDC");

        await usdt.mint(deployer.address, 100000n * 1000000n); // 100K USDT
        console.log("Minted 100K USDT");

        // Check again
        const newIdrxBal = await idrx.balanceOf(deployer.address);
        const newUsdcBal = await usdc.balanceOf(deployer.address);
        const newUsdtBal = await usdt.balanceOf(deployer.address);

        console.log("\n=== New Balances ===");
        console.log("IDRX:", hre.ethers.formatUnits(newIdrxBal, 2));
        console.log("USDC:", hre.ethers.formatUnits(newUsdcBal, 6));
        console.log("USDT:", hre.ethers.formatUnits(newUsdtBal, 6));
    }
}

main().then(() => process.exit(0)).catch(console.error);
