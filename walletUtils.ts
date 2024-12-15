import { ethers } from 'ethers';

export const connectWallet = async () => {
  // Check if Ethereum provider is available
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    console.log('Wallet connected:', address);
    return address;
  } else {
    throw new Error('No wallet provider found');
  }
};
