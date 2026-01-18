// Simple script to mint tokens after contracts are deployed
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    console.log("Account:", wallet.address);

    // Token addresses (deterministic)
    const IDRX = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const USDC = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const USDT = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    const mockERC20Path = path.join(__dirname, "../artifacts/src/MockERC20.sol/MockERC20.json");
    const MockERC20Artifact = JSON.parse(fs.readFileSync(mockERC20Path, "utf8"));

    const idrx = new ethers.Contract(IDRX, MockERC20Artifact.abi, wallet);
    const usdc = new ethers.Contract(USDC, MockERC20Artifact.abi, wallet);
    const usdt = new ethers.Contract(USDT, MockERC20Artifact.abi, wallet);

    // Check current balances
    console.log("\n=== Current Balances ===");
    let bal = await idrx.balanceOf(wallet.address);
    console.log("IDRX:", ethers.formatUnits(bal, 2));
    bal = await usdc.balanceOf(wallet.address);
    console.log("USDC:", ethers.formatUnits(bal, 6));
    bal = await usdt.balanceOf(wallet.address);
    console.log("USDT:", ethers.formatUnits(bal, 6));

    // Check if we need to mint
    if (Number(await idrx.balanceOf(wallet.address)) === 0) {
        console.log("\n=== Minting tokens ===");

        let tx = await idrx.mint(wallet.address, ethers.parseUnits("10000000", 2));
        await tx.wait();
        console.log("Minted 10M IDRX");

        tx = await usdc.mint(wallet.address, ethers.parseUnits("100000", 6));
        await tx.wait();
        console.log("Minted 100K USDC");

        tx = await usdt.mint(wallet.address, ethers.parseUnits("100000", 6));
        await tx.wait();
        console.log("Minted 100K USDT");

        console.log("\n=== New Balances ===");
        console.log("IDRX:", ethers.formatUnits(await idrx.balanceOf(wallet.address), 2));
        console.log("USDC:", ethers.formatUnits(await usdc.balanceOf(wallet.address), 6));
        console.log("USDT:", ethers.formatUnits(await usdt.balanceOf(wallet.address), 6));
    }

    console.log("\n✅ Done! Refresh MetaMask.");
}

main().catch(console.error);
