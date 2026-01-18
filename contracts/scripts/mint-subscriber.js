const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    // Account #1
    const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);

    console.log("Setup Subscriber:", wallet.address);

    // Addresses
    const IDRX = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const USDC = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const USDT = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    const mockERC20Path = path.join(__dirname, "../artifacts/src/MockERC20.sol/MockERC20.json");
    const abi = JSON.parse(fs.readFileSync(mockERC20Path, "utf8")).abi;

    const idrx = new ethers.Contract(IDRX, abi, wallet);
    const usdc = new ethers.Contract(USDC, abi, wallet);
    const usdt = new ethers.Contract(USDT, abi, wallet);

    console.log("Minting tokens...");
    await (await idrx.mint(wallet.address, ethers.parseUnits("10000000", 2))).wait();
    console.log("✅ 10,000,000 IDRX");

    await (await usdc.mint(wallet.address, ethers.parseUnits("100000", 6))).wait();
    console.log("✅ 100,000 USDC");

    await (await usdt.mint(wallet.address, ethers.parseUnits("100000", 6))).wait();
    console.log("✅ 100,000 USDT");
}

main().catch(console.error);
