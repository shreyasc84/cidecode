import { ethers } from "ethers";
import { EvidenceTracker__factory } from "../typechain-types";

async function main() {
  // Get the provider and signer
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  console.log("Deploying EvidenceTracker contract...");
  
  // Deploy the contract
  const EvidenceTrackerFactory = new EvidenceTracker__factory(wallet);
  const evidenceTracker = await EvidenceTrackerFactory.deploy();
  
  await evidenceTracker.deployed();
  
  console.log("EvidenceTracker deployed to:", evidenceTracker.address);
  
  // Verify the contract on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for block confirmation
    
    try {
      await hre.run("verify:verify", {
        address: evidenceTracker.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.error("Error verifying contract:", error);
    }
  }

  return evidenceTracker.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
