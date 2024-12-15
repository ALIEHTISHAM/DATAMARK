import { ethers } from 'ethers';

export const connectMetaMask = async () => {
  if (window.ethereum) {
    console.log("Requesting MetaMask connection...");

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Request accounts, ensuring MetaMask opens the selection prompt
    await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
    const accounts = await provider.send("eth_requestAccounts", []);

    if (accounts.length === 0) {
      throw new Error("No accounts found in MetaMask");
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log("Connected address:", address);

    return address;
  } else {
    throw new Error("MetaMask not found");
  }
};
