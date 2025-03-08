import { ethers } from "ethers";

export const SEPOLIA_CHAIN_ID = "0xaa36a7";
export const SEPOLIA_RPC_URL = "https://rpc.sepolia.org/";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: SEPOLIA_CHAIN_ID }],
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}

export function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function uploadEvidence(evidence: File) {
  // Mock IPFS upload for now
  const ipfsHash = "QmHash" + Math.random().toString(36).slice(2);
  return ipfsHash;
}

export async function storeEvidenceOnChain(ipfsHash: string, metadata: any) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  
  // Mock transaction for now
  const tx = {
    to: "0x0000000000000000000000000000000000000000",
    data: ethers.solidityPacked(["string", "string"], [ipfsHash, JSON.stringify(metadata)]),
  };

  const txResponse = await signer.sendTransaction(tx);
  return txResponse.hash;
}
