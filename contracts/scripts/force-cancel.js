const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Account #1 (Subscriber)
    const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
    console.log("Subscriber:", wallet.address);

    // Contract
    const CONTRACT_ADDR = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const abiPath = path.join(__dirname, "../artifacts/src/SubscriptionManager.sol/SubscriptionManager.json");
    const abi = JSON.parse(fs.readFileSync(abiPath, "utf8")).abi;
    const contract = new ethers.Contract(CONTRACT_ADDR, abi, wallet);

    // Plan ID (Assuming Plan 4 based on logs "0x...04", but let's check events or just try canceling standard IDs)
    // Error data said: 0x...04 implies Plan ID 4.
    const planId = 4; // Berdasarkan error data user

    console.log(`Canceling subscription for Plan ${planId}...`);
    try {
        const tx = await contract.cancelSubscription(planId);
        await tx.wait();
        console.log("✅ Subscription Canceled!");
    } catch (err) {
        console.log("❌ Failed to cancel:", err.message);
        // Coba plan lain jaga-jaga
        try {
            console.log("Trying Plan 1...");
            const tx = await contract.cancelSubscription(1);
            await tx.wait();
            console.log("✅ Subscription Plan 1 Canceled!");
        } catch (e) { console.log("Not Plan 1"); }
    }
}

main().catch(console.error);
