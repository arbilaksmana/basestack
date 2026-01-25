const { ethers } = require("ethers");
const db = require("better-sqlite3")("./db/database.sqlite");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Starting DB <-> Contract Sync...");

    // 1. Setup Provider & Signer
    const rpcUrl = process.env.RPC_URL || "https://sepolia.base.org";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not found in .env");
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) throw new Error("CONTRACT_ADDRESS not found in .env");

    console.log(`Using Wallet: ${wallet.address}`);
    console.log(`Contract: ${contractAddress}`);

    // 2. Load ABI
    // Using minimal ABI for createPlan + event
    const ABI = [
        "function createPlan(uint256 priceIdrx, uint256 priceUsdc, uint256 priceUsdt, uint256 billingInterval) returns (uint256)",
        "event PlanCreated(uint256 indexed planId, address indexed merchant)"
    ];
    const contract = new ethers.Contract(contractAddress, ABI, wallet);

    // 3. Read Plans from DB
    const plans = db.prepare("SELECT * FROM plans").all();
    console.log(`Found ${plans.length} plans in local DB.`);

    // 4. Process each plan
    for (const plan of plans) {
        console.log(`\nProcessing Plan ID ${plan.id}: "${plan.name}"`);
        console.log(`Current Onchain ID: ${plan.onchainPlanId} (Invalid)`);

        // Prepare params
        // Prices in DB are strings, need to convert to BigInt Wei
        // IDRX: 2 decimals, USDC/USDT: 6 decimals
        
        // Handle potential string formatting issues (remove commas if any)
        const pIdrx = plan.priceIdrx.toString().replace(/,/g, '');
        const pUsdc = plan.priceUsdc.toString().replace(/,/g, '');
        const pUsdt = plan.priceUsdt.toString().replace(/,/g, '');

        const priceIdrxWei = ethers.parseUnits(pIdrx, 2);
        const priceUsdcWei = ethers.parseUnits(pUsdc, 6);
        const priceUsdtWei = ethers.parseUnits(pUsdt, 6);
        const interval = plan.billingInterval;

        console.log(`Creating on-chain: IDRX=${pIdrx}, USDC=${pUsdc}, Interval=${interval}`);

        try {
            const tx = await contract.createPlan(priceIdrxWei, priceUsdcWei, priceUsdtWei, interval);
            console.log(`Tx sent: ${tx.hash}. Waiting for confirmation...`);
            
            const receipt = await tx.wait();
            
            // Parse event to get new ID
            const event = receipt.logs.find(log => {
                try {
                    return contract.interface.parseLog(log)?.name === "PlanCreated";
                } catch(e) { return false; }
            });

            if (event) {
                const parsed = contract.interface.parseLog(event);
                const newOnchainPlanId = Number(parsed.args.planId);
                console.log(`SUCCESS! New Onchain Plan ID: ${newOnchainPlanId}`);

                // 5. Update DB
                const updateStmt = db.prepare("UPDATE plans SET onchainPlanId = ? WHERE id = ?");
                updateStmt.run(newOnchainPlanId, plan.id);
                console.log(`Database updated for Plan ${plan.id}`);
            } else {
                console.error("FAILED to find PlanCreated event in receipt!");
            }

        } catch (err) {
            console.error(`ERROR creating plan ${plan.id}:`, err.message);
        }
    }

    console.log("\nDone!");
}

main().catch(console.error);
