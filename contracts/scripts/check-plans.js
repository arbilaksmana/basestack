const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const rpcUrl = "https://sepolia.base.org";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Contract address from .env or hardcoded if .env fails to load in this context
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x98CB5BCfeB7135eCF393a30F11A80D4c69B82898";
    
    console.log("Checking contract:", contractAddress);
    
    // Minimal ABI to read plans
    const ABI = [
        "function planCount() view returns (uint256)",
        "function plans(uint256 planId) view returns (address merchant, uint256 priceIdrx, uint256 priceUsdc, uint256 priceUsdt, uint256 billingInterval, bool active)"
    ];
    
    const contract = new ethers.Contract(contractAddress, ABI, provider);
    
    try {
        const count = await contract.planCount();
        console.log(`Total Plans found: ${count}`);
        
        for (let i = 1; i <= Number(count); i++) {
            const plan = await contract.plans(i);
            console.log(`Plan #${i}: Active=${plan.active}, Interval=${plan.billingInterval}`);
        }
    } catch (err) {
        console.error("Error reading contract:", err);
    }
}

main();
